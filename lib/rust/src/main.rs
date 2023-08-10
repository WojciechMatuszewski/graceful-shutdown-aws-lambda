use lambda_http::{run, service_fn, Body, Error, Request, RequestExt, Response};

use tokio::{
    select,
    signal::unix::{signal, SignalKind},
};

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let message = format!("Hello from Rust!");

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(message.into())
        .map_err(Box::new)?;
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    tokio::spawn(async move {
        let mut sigterm = signal(SignalKind::terminate()).unwrap();
        loop {
            select! {
                _= sigterm.recv() => println!("Received the SIGTERM")
            }
        }
    });

    let result = run(service_fn(function_handler)).await;
    return result;
}
