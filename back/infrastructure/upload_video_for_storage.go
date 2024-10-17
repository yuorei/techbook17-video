package infrastructure

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

func (i *Infrastructure) UploadVideoForStorage(ctx context.Context, videoID string) (string, error) {
	err := filepath.Walk("output/"+videoID, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 対象のファイルかどうかを確認
		if strings.HasPrefix(filepath.Base(path), "output_"+videoID) && (strings.HasSuffix(path, ".m3u8") || strings.HasSuffix(path, ".ts")) {
			// TODO: 失敗した時にtsファイルを削除できるように修正する
			defer func() error {
				err = os.Remove(path)
				if err != nil {
					return err
				}
				return nil
			}()
			bucketName := "video"
			err := uploadVideoForS3(path, bucketName)
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return "", fmt.Errorf("failed to remove output files: %w", err)
	}

	bucketName := "video"
	url := fmt.Sprintf("%s/%s/%s/output_%s.m3u8", os.Getenv("AWS_S3_URL"), bucketName, videoID, videoID)
	return url, nil
}

func uploadVideoForS3(path, bucketName string) error {
	ctx := context.Background()
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")

	cred := credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")
	cfg, err := config.LoadDefaultConfig(ctx, config.WithCredentialsProvider(cred))
	if err != nil {
		return err
	}

	// change object address style
	client := s3.NewFromConfig(cfg, func(options *s3.Options) {
		options.UsePathStyle = true
		options.BaseEndpoint = aws.String(os.Getenv("AWS_S3_ENDPOINT"))
		options.Region = "ap-northeast-1"
	})

	// get buckets
	lbo, err := client.ListBuckets(ctx, nil)
	if err != nil {
		return err
	}
	buckets := make(map[string]struct{}, len(lbo.Buckets))
	for _, b := range lbo.Buckets {
		buckets[*b.Name] = struct{}{}
	}

	if _, ok := buckets[bucketName]; !ok {
		_, err = client.CreateBucket(ctx, &s3.CreateBucketInput{
			Bucket: &bucketName,
			ACL:    types.BucketCannedACLPublicRead,
		})
		if err != nil {
			return err
		}
	}

	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	defer func() error {
		err := os.Remove(path)
		if err != nil {
			return err
		}
		return nil
	}()

	// put object
	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(strings.Split(path, "/")[1] + "/" + strings.Split(path, "/")[2]),
		Body:   file,
		ACL:    types.ObjectCannedACLPublicRead,
	})

	if err != nil {
		return fmt.Errorf("failed to upload file: %w", err)
	}
	log.Println("Successful upload: ", path)

	return nil
}
