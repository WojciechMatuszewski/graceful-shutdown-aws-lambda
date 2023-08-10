package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context) (events.APIGatewayV2HTTPResponse, error) {
	return events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Body:       `{"message": "Hello from Go!"}`,
	}, nil
}

func main() {

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGTERM)

	go func() {
		<-sig
		log.Printf("SIGTERM received. Now is the ideal time to close connections")
	}()

	lambda.Start(handler)

}
