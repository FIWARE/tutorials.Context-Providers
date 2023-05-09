ARG NODE_VERSION=16
ARG DOWNLOAD=latest

########################################################################################
#
# This build stage retrieves the source code from GitHub. The default download is the 
# latest tip of the master of the named repository on GitHub.
#
# To obtain the latest stable release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=stable
#
# To obtain any specific version of a release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=1.7.0
#
# For development purposes, to create a development image including a running Distro, 
# run this Docker file with the parameter:
#
# --target=builder
#
######################################################################################## 
FROM node:${NODE_VERSION} AS builder

# hadolint ignore=DL3008
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

COPY . /opt/proxy
WORKDIR /opt/proxy

# hadolint ignore=DL3008
RUN \
  # Ensure that Git is installed prior to running npm install
  apt-get install -y --no-install-recommends git && \
  echo "INFO: npm install --production..." && \
  npm install --only=prod --no-package-lock --no-optional && \
  # Remove Git and clean apt cache
  apt-get clean && \
  apt-get remove -y git && \
  apt-get -y autoremove

USER node
ENV NODE_ENV=development
# Ports used by application
EXPOSE ${WEB_APP_PORT:-3000} ${DUMMY_DEVICES_PORT:-3001}
CMD ["node", "/opt/proxy/bin/www"]
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
   CMD npm run healthcheck

########################################################################################
#
# This build stage creates an anonymous user to be used with the distroless build
# as defined below.
#
########################################################################################
FROM node:${NODE_VERSION} AS anon-user
RUN sed -i -r "/^(root|nobody)/!d" /etc/passwd /etc/shadow /etc/group \
    && sed -i -r 's#^(.*):[^:]*$#\1:/sbin/nologin#' /etc/passwd


#
# The following creates a distroless build for production.
#

FROM gcr.io/distroless/nodejs:${NODE_VERSION}
ARG TARGET
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION
ARG SOURCE_COMMIT
ENV GIT_COMMIT=$SOURCE_COMMIT

LABEL "maintainer"="FIWARE Foundation <fiware.eu@gmail.com>"
LABEL "org.opencontainers.image.authors"="https://www.fiware.org/contact-us/"
LABEL "org.opencontainers.image.vendor"="FIWARE Foundation"
LABEL "org.opencontainers.image.licenses"="MIT"
LABEL "org.opencontainers.image.title"="Adminstration Asset Shell Proxy"
LABEL "org.opencontainers.image.description"="Simple Node.js express application to proxy an AAS"
LABEL "org.opencontainers.image.source"=https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}
LABEL "org.nodejs.version"=${NODE_VERSION}

COPY --from=builder /opt/proxy /opt/proxy
WORKDIR /opt/proxy

USER nobody
ENV NODE_ENV=production
# Ports used by application
EXPOSE ${WEB_APP_PORT:-3000} 
CMD ["./bin/www"]

