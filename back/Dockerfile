FROM golang:1.23 as build

WORKDIR /go/src/app

RUN apt-get update -y && \
    apt-get install -y ffmpeg

COPY . .

RUN go mod download

RUN  go build -o /app
ENV TZ Asia/Tokyo

EXPOSE 8080

CMD ["/app"]
