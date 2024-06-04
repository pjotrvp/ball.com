FROM golang:1.22-alpine AS builder
RUN mkdir /app
ADD ./order-service/. /app
WORKDIR /app
#COPY . .
#RUN go mod download
RUN go build 
#-o main .

#FROM alpine:latest
#WORKDIR /order-service
#COPY --from=builder /order-service/. .
#EXPOSE 8080
CMD ["/app/order-service"]