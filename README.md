# This repository is no longer maintained and cordelia was succeeded by `crdnl/cordelia2`.

# crdnl/cordelia

Cordelia is a Discord bot that allows authenticating Discord users using Google's OAuth 2.0 provider.

### Disclaimer
This is not an officially supported Google product. As such, it may not recieve updates, fixes, or support.

# Configuring Cordelia

Cordelia uses a simple JavaScript file that exports the needed values. You copy the provided sample file `config.js.example` to `config.js` and modify as needed:

# Running Cordelia

## Build the Docker container
```
docker build .
```

### Docker

```
docker run -v ./config.js:/usr/src/app/config.js -p 8080:8080 qmarchi/cordelia
```

### Docker Compose

```
version: "3"
services:
  cordelia:
    image: qmarchi/cordelia:latest
    container_name: cordelia
    ports:
      - 8080:8080
```
