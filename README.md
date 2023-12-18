[![FIWARE Banner](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/fiware.png)](https://www.fiware.org/developers)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/)

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/core.svg)](https://github.com/FIWARE/catalogue/blob/master/core/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Relationships-Linked-Data.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)
[![NGSI LD](https://img.shields.io/badge/NGSI-LD-d6604d.svg)](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.04.02_60/gs_cim009v010402p.pdf)
[![JSON LD](https://img.shields.io/badge/JSON--LD-1.1-f06f38.svg)](https://w3c.github.io/json-ld-syntax/) <br/>
[![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

This tutorial discusses the usage of subscriptions and registrations within NGSI-LD and highlights the similarities and
differences between the equivalent NGSI-v2 and NGSI-LD operations. The tutorial is an analogue of the original
context-provider and subscriptions tutorials but uses API calls from the **NGSI-LD** interface throughout.

The tutorial uses [cUrl](https://ec.haxx.se/) commands throughout, but is also available as
[Postman documentation](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/2c53b7c2bce9fd7b7b47)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/FIWARE/tutorials.LD-Subscriptions-Registrations/tree/NGSI-LD)

-   このチュートリアルは[日本語](README.ja.md)でもご覧いただけます。

> [!NOTE]
> This tutorial is designed for **NGSI-v2** developers looking to switch or upgrade systems to
**NGSI-LD**, if you are building a linked data system from scratch or you are not already familiar with **NGSI-v2** then
it is recommmended that you look directly at the
[NGSI-LD developers tutorial](https://ngsi-ld-tutorials.readthedocs.io/) documentation.

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Understanding Linked Data Subscriptions and Registrations](#understanding-linked-data-subscriptions-and-registrations)
    -   [Entities within a stock management system](#entities-within-a-stock-management-system)
    -   [Stock Management frontend](#stock-management-frontend)
-   [Prerequisites](#prerequisites)
    -   [Docker](#docker)
    -   [Cygwin](#cygwin)
-   [Architecture](#architecture)
-   [Start Up](#start-up)
-   [Interactions between Components](#interactions-between-components)
    -   [Using Subscriptions with NGSI-LD](#using-subscriptions-with-ngsi-ld)
        -   [Create a Subscription (Store 1) - Low Stock](#create-a-subscription-store-1---low-stock)
        -   [Create a Subscription (Store 2) - Low Stock](#create-a-subscription-store-2---low-stock)
        -   [Read Subscription Details](#read-subscription-details)
        -   [Retrieving Subscription Events](#retrieving-subscription-events)
    -   [Using Registrations with NGSI-LD](#using-registrations-with-ngsi-ld)
        -   [Create a Registration](#create-a-registration)
        -   [Read Registration Details](#read-registration-details)
        -   [Read from Store 1](#read-from-store-1)
        -   [Read direct from the Context Provider](#read-direct-from-the-context-provider)
        -   [Direct update of the Context Provider](#direct-update-of-the-context-provider)
        -   [Forwarded Update](#forwarded-update)

</details>

# Understanding Linked Data Subscriptions and Registrations

> “Do not repeat after me words that you do not understand. Do not merely put on a mask of my ideas, for it will be an
> illusion and you will thereby deceive yourself.”
>
> ― Jiddu Krishnamurti

NGSI-LD Subscriptions and Registrations provide the basic mechanism to allow the components within a Smart Linked Data
Solution to interact with each other.

As a brief reminder, within a distributed system, subscriptions inform a third party component that a change in the
context data has occurred (and the component needs to take further actions), whereas registrations tell the context
broker that additional context information is available from another source.

Both of these operations require that the receiving component fully understands the requests it receives, and is capable
of creating and interpreting the resultant payloads. The differences here between NGSI-v2 and NGSI-LD operations is
small, but there has been a minor amendment to facilite the incorporation of linked data concepts, and therefore the
contract between the various components has changed to include minor updates.

## Entities within a stock management system

The relationship between our Linked Data entities is defined as shown, in addition to the existing data, the `tweets`
attribute will be supplied by a _Context Provider_. In all other respects this model remains the same as the
[previous tutorial](https://github.com/FIWARE/tutorials.Working-with-Linked-Data/) :

![](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/entities.png)

## Stock Management frontend

The simple Node.js Express application has updated to use NGSI-LD in the previous
[tutorial](https://github.com/FIWARE/tutorials.Working-with-Linked-Data/). We will use the monitor page to watch the
status of recent requests, and a two store pages to buy products. Once the services are running these pages can be
accessed from the following URLs:

#### Event Monitor

The event monitor can be found at: `http://localhost:3000/app/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/monitor.png)

#### Store 001

Store001 can be found at: `http://localhost:3000/app/store/urn:ngsi-ld:Building:store001`

![Store](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/store.png)

#### Store 002

Store002 can be found at: `http://localhost:3000/app/store/urn:ngsi-ld:Building:store002`

![Store2](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/store2.png)

# Prerequisites

## Docker

To keep things simple all components will be run using [Docker](https://www.docker.com). **Docker** is a container
technology which allows to different components isolated into their respective environments.

-   To install Docker on Windows follow the instructions [here](https://docs.docker.com/docker-for-windows/)
-   To install Docker on Mac follow the instructions [here](https://docs.docker.com/docker-for-mac/)
-   To install Docker on Linux follow the instructions [here](https://docs.docker.com/install/)

**Docker Compose** is a tool for defining and running multi-container Docker applications. A
[YAML file](https://raw.githubusercontent.com/fiware/tutorials.LD-Subscriptions-Registrations/master/docker-compose/orion-ld.yml)
is used configure the required services for the application. This means all container services can be brought up in a
single command. Docker Compose is installed by default as part of Docker for Windows and Docker for Mac, however Linux
users will need to follow the instructions found [here](https://docs.docker.com/compose/install/)

## Cygwin

We will start up our services using a simple bash script. Windows users should download [cygwin](http://www.cygwin.com/)
to provide a command-line functionality similar to a Linux distribution on Windows.

# Architecture

The demo Supermarket application will send and receive NGSI-LD calls to a compliant context broker. Since the NGSI-LD
interface is available on an experimental version of the
[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/), the demo application will only make use of one
FIWARE component.

Currently, the Orion Context Broker relies on open source [MongoDB](https://www.mongodb.com/) technology to keep
persistence of the context data it holds. To request context data from external sources, a simple Context Provider NGSI
proxy has also been added. To visualize and interact with the Context we will add a simple Express application

Therefore, the architecture will consist of four elements:

-   The [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) which will receive requests using
    [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json)
-   The underlying [MongoDB](https://www.mongodb.com/) database :
    -   Used by the Orion Context Broker to hold context data information such as data entities, subscriptions and
        registrations
-   The **Context Provider NGSI** proxy which will:
    -   receive requests using
        [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json#/)
    -   makes requests to publicly available data sources using their own APIs in a proprietary format
    -   returns context data back to the Orion Context Broker in
        [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json#/)
        format.
-   The **Stock Management Frontend** which will:
    -   Display store information
    -   Show which products can be bought at each store
    -   Allow users to "buy" products and reduce the stock count.

Since all interactions between the elements are initiated by HTTP requests, the entities can be containerized and run
from exposed ports.

![](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/architecture.png)

The necessary configuration information can be seen in the services section of the associated `orion-ld.yml` file. It
has been described in a [previous tutorial](https://github.com/FIWARE/tutorials.Working-with-Linked-Data/)

# Start Up

All services can be initialised from the command-line by running the
[services](https://github.com/FIWARE/tutorials.LD-Subscriptions-Registrations/blob/NGSI-v2/services) Bash script
provided within the repository. Please clone the repository and create the necessary images by running the commands as
shown:

```bash
git clone https://github.com/FIWARE/tutorials.Context-Providers.git
cd tutorials.Context-Providers
git checkout NGSI-LD

./services [orion|scorpio|stellio]
```

> **Note:** If you want to clean up and start over again you can do so with the following command:
>
> ```
> ./services stop
> ```

---

# Interactions between Components

## Using Subscriptions with NGSI-LD

Goto `http://localhost:3000/app/store/urn:ngsi-ld:Building:store001` to display and interact with the Supermarket data.

### Create a Subscription (Store 1) - Low Stock

NGSI-LD subscriptions can be set up using the `/ngsi-ld/v1/subscriptions/` endpoint and in a similar manner to the
NGSI-v2 `/v2/subscriptions` endpoint. The payload body is slightly different however. Firstly the linked data `@context`
must be present either as an attribute or in the `Link` header. If the `@context` is placed in the body the
`Context-Type` header must state that the payload is `application/ld+json` - i.e. Linked Data plus JSON. The supplied
`@context` will also be used when making notifications as part of the notification request.

The `type` of the NGSI-LD subscription request is always `type=Subscription`. The structure of the subscription has
changed. When setting up a subscription, there is no longer a separate `subject` section to the payload, entities to
watch and trigger conditions are now set at the same level as the `description` of the subscription.

-   `condition.attrs` has been moved up a level and renamed to `watchedAttributes`
-   `condition.expression` has been moved up a level and renamed to `q`

The `notification` section of the body states that once the conditions of the subscription have been met, a POST request
containing all affected Shelf entities will be sent to the URL `http://tutorial:3000/subscription/low-stock-store001`.
It is now possible to amend the notification payload by requesting `notification.format=keyValues` and remove the
`@context` from the notification body by stating `notification.endpoint.accept=application/json`. The `@context` is not
lost, it is merely passed as a `Link` header. In summary, all of the flags within a subscription work in the same manner
as a GET request to the context broker itself. If no flags are set, a full NGSI-LD response including the `@context` is
returned by default, and the payload can be reduced and amended by adding in further restrictions.

#### 1️⃣ Request:

```console
curl -L -X POST 'http://localhost:1026/ngsi-ld/v1/subscriptions/' \
-H 'Content-Type: application/ld+json' \
--data-raw '{
  "description": "Notify me of low stock in Store 001",
  "type": "Subscription",
  "entities": [{"type": "Shelf"}],
  "watchedAttributes": ["numberOfItems"],
  "q": "numberOfItems<10;locatedIn==%22urn:ngsi-ld:Building:store001%22",
  "notification": {
    "attributes": ["numberOfItems", "stocks", "locatedIn"],
    "format": "keyValues",
    "endpoint": {
      "uri": "http://tutorial:3000/subscription/low-stock-store001",
      "accept": "application/json"
    }
  },
   "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld"
}'
```

### Create a Subscription (Store 2) - Low Stock

This second request fires notifications to a different endpoint (URL
`http://tutorial:3000/subscription/low-stock-store002`.) The `notification.format=normalized` and
`notification.endpoint.accept=application/ld+json` will ensure that the `@context` is passed in the body of the
notification request and that the payload will consist of the expanded entities.

#### 2️⃣ Request:

```console
curl -L -X POST 'http://localhost:1026/ngsi-ld/v1/subscriptions/' \
-H 'Content-Type: application/json' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
--data-raw '{
  "description": "LD Notify me of low stock in Store 002",
  "type": "Subscription",
  "entities": [{"type": "Shelf"}],
  "watchedAttributes": ["numberOfItems"],
  "q": "numberOfItems<10;locatedIn==%22urn:ngsi-ld:Building:store002%22",
  "notification": {
    "attributes": ["numberOfItems", "stocks", "locatedIn"],
    "format": "normalized",
    "endpoint": {
      "uri": "http://tutorial:3000/subscription/low-stock-store002",
      "accept": "application/ld+json"
    }
  }
}'
```

### Read Subscription Details

Subscription details can be read by making a GET request to the `/ngsi-ld/v1/subscriptions/`. All subscription CRUD
actions continue to be mapped to the same HTTP verbs as before. Adding the `Accept: application/json` will remove the
`@context` element from the response body.

#### 3️⃣ Request:

```console
curl -L -X GET 'http://localhost:1026/ngsi-ld/v1/subscriptions/'
```

#### Response:

The response consists of the details of the subscriptions within the system. The parameters within the `q` attribute
have been expanded to use the full URIs, as internally the broker consistently uses long names. The differences between
the payloads offered by the two subscriptions will be discussed below.

```json
[
    {
        "id": "urn:ngsi-ld:Subscription:5e62405ee232da3a07b5fa7f",
        "type": "Subscription",
        "description": "Notify me of low stock in Store 001",
        "entities": [
            {
                "type": "Shelf"
            }
        ],
        "watchedAttributes": ["numberOfItems"],
        "q": "https://fiware.github.io/tutorials.Step-by-Step/schema/numberOfItems<10;https://fiware.github.io/tutorials.Step-by-Step/schema/locatedIn==%22urn:ngsi-ld:Building:store001%22",
        "notification": {
            "attributes": ["numberOfItems", "stocks", "locatedIn"],
            "format": "keyValues",
            "endpoint": {
                "uri": "http://tutorial:3000/subscription/low-stock-store001",
                "accept": "application/json"
            }
        },
        "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld"
    },
    {
        "id": "urn:ngsi-ld:Subscription:5e624063e232da3a07b5fa80",
        "type": "Subscription",
        "description": "Notify me of low stock in Store 002",
        "entities": [
            {
                "type": "Shelf"
            }
        ],
        "watchedAttributes": ["numberOfItems"],
        "q": "https://fiware.github.io/tutorials.Step-by-Step/schema/numberOfItems<10;https://fiware.github.io/tutorials.Step-by-Step/schema/locatedIn==%22urn:ngsi-ld:Building:store002%22",
        "notification": {
            "attributes": ["numberOfItems", "stocks", "locatedIn"],
            "format": "keyValues",
            "endpoint": {
                "uri": "http://tutorial:3000/subscription/low-stock-store002",
                "accept": "application/json"
            }
        },
        "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld"
    }
]
```

### Retrieving Subscription Events

Open two tabs on a browser. Go to the event monitor (`http://localhost:3000/app/monitor`) to see the payloads that are
received when a subscription fires, and then go to store001
(`http://localhost:3000/app/store/urn:ngsi-ld:Building:store001`) and buy beer until less than 10 items are in stock.
The low stock message should be displayed on screen.

![low-stock](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/low-stock-warehouse.png)

`low-stock-store001` is fired when the Products on the shelves within Store001 are getting low, the subscription payload
can be seen below:

![low-stock-json](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/low-stock-monitor.png)

The data within the payload consists of key-value pairs of the attributes which were specified in the request. This is
because the subscription was created using the `format=keyValues` attribute. The `@context` is not present in the
payload body since `endpoint.accept=application/json` was set. The effect is to return a `data` array in a very similar
format to the `v2/subscription/` payload. In addition to the `data` array, the `subscriptionId` is included in the
response, along with a `notifiedAt` element which describes when the notification was fired.

Now go to store002 (`http://localhost:3000/app/store/urn:ngsi-ld:Building:store002`) and buy beer until fewer than 10
items are in stock. The low stock message is once again displayed on screen, the payload can be seen within the event
monitor.

![low-stock-ld](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/low-stock-monitor-ld.png)

The second subscription has been set up to pass the full normalized NGSI-LD payload along with the `@context`. This has
been achieved by using the using the `format=normalized` attribute within the subscription itself, as well as setting
`endpoint.accept=application/ld+json`, so that the `@context` is also passed with each entity.

## Using Registrations with NGSI-LD

Context Registrations allow some (or all) data within an entity to be provided by an external context provider. It could
be another full context-provider a separate micro-service which only responds to a subset of the NGSI-LD endpoints.
However, there needs to be a contract created as to who supplies what.

All **NGSI-LD** registrations can be subdivided into one of four types:

### Additive Registrations

A Context Broker is permitted to hold context data about the Entities and Attributes locally itself, and also obtain
data from (possibly multiple) external sources

-   An **inclusive** Context Source Registration specifies that the Context Broker considers all registered Context
    Sources as equals and will distribute operations to those Context Sources even if relevant context data is available
    directly within the Context Broker itself (in which case, all results will be integrated in the final response).
    This federative and is the default mode of operation.

-   An **auxiliary** Context Source Registration never overrides data held directly within a Context Broker. Auxiliary
    distributed operations are limited to context information consumption operations (i.e. entity **GET** operations).
    Context data from auxiliary context sources is only included if it is supplementary to the context data otherwise
    available to the Context Broker.

### Proxied Registrations

A Context Broker is not permitted to hold context data about the Entities and Attributes locally itself. All context
data is obtained from the external registered sources.

-   An **exclusive** Context Source Registration specifies that all of the registered context data is held in a single
    location external to the Context Broker. The Context Broker itself holds no data locally about the registered
    Attributes and no overlapping proxied Context Source Registrations shall be supported for the same combination of
    registered Attributes on the Entity. An exclusive registration must be fully specified. It always relates to
    specific Attributes found on a single Entity. It can be used for actuations

-   A **redirect** Context Source Registration also specifies that the registered context data is held in a location
    external to the Context Broker, but potentially multiple distinct redirect registrations can apply at the same time.

### Accepted Operations

**NGSI-LD** also defines groups of operations that are allowed on the registrant. The default group is called
`federationOps` and includes all entity **GET** operations. Three other common operational groups are also defined
`updateOps` (for actuators), `retrieveOps` (for "lazy" sensors) and `redirectionOps` (for hierarchical broker
architectures). The details won't be covered here, but it should be noted that unless specified, the default **NGSI-LD**
operation is `federationOps` using `inclusive` mode, whereas the default **NGSI-v2** operation is
`updateOps + retrieveOps` using `exclusive` mode.

For simplicity, for **NGSI-v2** - **NGSI-LD** comparison, this tutorial will only deal with `exclusive` mode, which is
the only mode offered by **NGSI-v2** brokers.

With the **NGSI-LD** `exclusive` mode, all registrations can be subdivided into one of two types. Simple registrations
where a single context provider is responsible for the maintenance of the whole entity, and partial registrations where
attributes are spread across multiple context providers. For a simple registration, all context requests are forwarded

| Request    | Action at **Context Broker**                                                | Action at **Context Provider**                                                                      |
| ---------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **GET**    | Pass request to **Context Provider**, proxy the response back unaltered.    | Respond to context broker with the result of the GET request based on the entities held internally  |
| **PATCH**  | Pass request to **Context Provider**, proxy back the HTTP back status code. | Update the entity within the **Context Provider**, Respond to the context broker with a status code |
| **DELETE** | Pass request to **Context Provider**                                        | Delete the entity within the **Context Provider**, Respond to the context broker with a status code |

Effectively every simple registration is saying _"this entity is held elsewhere"_, but the entity data can be requested
and modified via requests to this context broker. All context brokers should support simple registrations, and indeed,
simple registrations such as these are necessary for the operation of federated arrays of context brokers working in
large scale systems, where there is no concept of "entity exclusiveness", that is no entity is bound to an individual
broker.

For partial registrations the situation is more complex

| Request    | Action at **Context Broker**                                                                                                                                                                                                | Action at **Context Provider**                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **GET**    | Assuming an entity exists locally, pass request for additional proxied attributes to **Context Provider**, concatenate a response back for locally held attributes and additional information from the **Context Provider** | Respond to context broker with the result of the GET request based on the entities held internally                                   |
| **PATCH**  | Update any locally held attributes, Pass update requests for additional attributes to **Context Provider**, and return **success** or **partial success** HTTP status code dependent upon the overall result.               | Update the requested attributes of the entity held within the **Context Provider**. Respond to the context broker with a status code |
| **DELETE** | If deleting an entity, remove the complete local instance. If deleting locally held attributes remove them. If deleting attributes held in the **Context Provider**, pass request on to **Context Provider**                | Delete the entity attributes within the **Context Provider**, Respond to the context broker with a status code                       |

Each partial registration is saying _"additional augmented context for this entity is held elsewhere"_. The entity data
can be requested and modified via requests to this context broker. In this case the entity data is effectively bound to
an individual context broker, and therefore may need special processing when running in a large-scale federated
environment. Covering the special needs of the federation use-case is not the concern of this tutorial here.

Note that within the context broker a single entity cannot partake in both a simple registration and a partial
registration at the same time, as this would indicate that both the whole entity and only part of that entity are to be
retrieved remotely and this is nonsensical. If such a situation is requested, the context broker will return with a
`409` - **Conflict** HTTP response.

Also, a simple registration for an entity will be rejected if an entity already exists within the context broker, and a
partial registration for an entity attribute will be rejected if the attribute exists within the context broker (or is
already subject to a partial registration). The latter may be ovecome with the use of the `datasetId`.

Internally the [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) header is
used to avoid circular dependencies where **context broker A** registers an entity with **context broker B** which
registers an entity with **context broker C** which registers an entity with **context broker A** again. The
`X-Forwarded-For` Header is removed prior to responding to a client however.

With normal operation, the NGSI-LD response does not expose whether data collated from multiple sources is held directly
within the context broker or whether the information has been retrieved externally. It is only when an error occurs
(e.g. timeout) that the HTTP status error code reveals that externally held information could not be retrieved or
amended.

### Create a Registration

All NGSI-LD Context Provider Registration actions take place on the `/ngsi-ld/v1/csourceRegistrations/` endpoint. The
standard CRUD mappings apply. The `@context` must be passed either as a `Link` header or within the main body of the
request.

The body of the request is similar to the **NGSI-v2** equivalent with the following modifications:

-   The **NGSI-v2** `dataProvided` object is now an array called `information`.
-   **NGSI-v2** `attrs` have been split into separate arrays of `propertyNames` and `relationshipNames`
-   The **NGSI-v2** `provider.url` has moved up to `endpoint`
-   The **NGSI-LD** `mode` and `operations` are now required - if they are missing the defaults are `federationOps` and
    `inclusive` which does not match the default **NGSI-v2** `supportedForwardingMode`

`contextSourceInfo` usually defines additional HTTP Headers which are passed to the registrant, but `jsonldContext` is a
special key which fires a JSON-LD expansion/compaction operation to ensure that the attribute names within the request
match the expected **NGSI-v2** attribute names.

#### 4️⃣ Request:

```console
curl -iX POST 'http://localhost:1026/ngsi-ld/v1/csourceRegistrations/' \
-H 'Content-Type: application/json' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
--data-raw ' {
    "type": "ContextSourceRegistration",
    "information": [
        {
            "entities": [
                {
                    "type": "Building",
                    "id": "urn:ngsi-ld:Building:store001"
                }
            ],
            "propertyNames": [
                "tweets"
            ]
        }
    ],
    "contextSourceInfo":[
        {
            "key": "jsonldContext",
            "value": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld"
        }
    ],
    "mode": "exclusive",
    "operations": [
        "updateOps", "retrieveOps"
    ],
    "endpoint": "http://tutorial:3000/static/tweets"
}'
```

> [!NOTE]
> that `propertyNames` and `relationshipNames` have replaced the older `properties` attribute that was is
> defined in the 1.1.1 NGSI-LD core context. It was replaced in order to offer full GeoJSON-LD support. Your context
> broker may or may not support the updated core context

### Read Registration Details

Retrieving the registration details can be made by sending a GET request to the `/ngsi-ld/v1/csourceRegistrations/`
endpoint, along with an appropriate JSON-LD context in the `Link` header and the `type` of entity to filter

#### 5️⃣ Request:

```console
curl -G -iX GET 'http://localhost:1026/ngsi-ld/v1/csourceRegistrations/' \
-H 'Accept: application/ld+json' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-d 'type=Building'
```

#### Response:

The response returns the details of the registration. In this case the short names of the `properties` have been
returned, along with the `@context`.

```jsonld
[
    {
        "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld",
        "id": "urn:ngsi-ld:ContextSourceRegistration:5e6242179c26be5aef9991d4",
        "type": "ContextSourceRegistration",
        "endpoint": "http://tutorial:3000/static/tweets",
        "information": [
            {
                "entities": [
                    {
                        "id": "urn:ngsi-ld:Building:store001",
                        "type": "Building"
                    }
                ],
                "properties": [
                    "tweets"
                ]
            }
        ],
        "contextSourceInfo":[
            {
                "key": "jsonldContext",
                "value": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld"
            }
        ],
        "mode": "exclusive",
        "operations": [
            "updateOps", "retrieveOps"
        ]
    }
]
```

### Read from Store 1

Once a registration has been set up, the additional registered `properties` and `relationships` are transparently
returned when an requested entity is requested. For simple registrations, a request to obtain the whole entity will be
proxied to the registered `endpoint`, for partial registrations the `properties` and `relationships` are added to the
existing entity held within the context broker.

#### 6️⃣ Request:

```console
curl -iX GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Content-Type: application/json'
```

> Note that at the time of writing, for the federated Scorpio broker, this request indicates the retrieval of a local
> entity only - forwarded data from a registration must be retrieved using:
> `/ngsi-ld/v1/entities/?id=urn:ngsi-ld:Building:store001` instead.

#### Response:

The response now holds an additional `tweets` Property, which returns the values obtained from
`http://tutorial:3000/static/tweets/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001` - i.e. the forwarding endpoint.

```jsonld
{
    "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld",
    "id": "urn:ngsi-ld:Building:store001",
    "type": "Building",
    "furniture": {
        "type": "Relationship",
        "object": [
            "urn:ngsi-ld:Shelf:unit001",
            "urn:ngsi-ld:Shelf:unit002",
            "urn:ngsi-ld:Shelf:unit003"
        ]
    },
    "address": {
        "type": "Property",
        "value": {
            "streetAddress": "Bornholmer Straße 65",
            "addressRegion": "Berlin",
            "addressLocality": "Prenzlauer Berg",
            "postalCode": "10439"
        },
        "verified": {
            "type": "Property",
            "value": true
        }
    },
    "name": {
        "type": "Property",
        "value": "Bösebrücke Einkauf"
    },
    "category": {
        "type": "Property",
        "value": "commercial"
    },
    "location": {
        "type": "GeoProperty",
        "value": {
            "type": "Point",
            "coordinates": [
                13.3986,
                52.5547
            ]
        }
    },
    "tweets": {
        "type": "Property",
        "value": [
            "It has great practical value – you can wrap it around you for warmth as you bound across the cold moons of Jaglan Beta;",
            "You can lie on it on the brilliant marble-sanded beaches of Santraginus V, inhaling the heady sea vapours;",
            "You can sleep under it beneath the stars which shine so redly on the desert world of Kakrafoon;",
            "Use it to sail a mini raft down the slow heavy river Moth;",
            "Wet it for use in hand-to-hand-combat;",
            "Wrap it round your head to ward off noxious fumes or to avoid the gaze of the Ravenous Bugblatter Beast of Traal  (a mindboggingly stupid animal, it assumes that if you can’t see it, it can’t see you – daft as a bush, but very, very ravenous);",
            "You can wave your towel in emergencies as a distress signal, and of course dry yourself off with it if it still seems to be clean enough."
        ]
    }
}
```

The same response data can be seen within the supermarket application itself. In practice this data has been created via
a series of requests - the context broker is responsible for the `urn:ngsi-ld:Building:store001` data, however it checks
to see if any further information can be provided from other sources. In our case the `CSourceRegistration` indicates
that one further attribute _may_ be available. The broker then requests `tweets` information from the context provider,
and provided that it responds in a timely manner, the `tweets` information is added to the resultant payload.

The supermarket application displays the received data on screen within the supermarket application itself:

![tweets-1](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/tweets-1.png)

### Read direct from the Context Provider

Every context-provider must stand by a fixed contract. At a minimum must be able to respond to varieties of the
`/ngsi-ld/v1/entities/<entity-id>` GET request. If the registration is limited to certain properties, this request will
also contain an `attrs` parameter in the query string.

Dependent upon the use case of the context-provider, it may or may not need to be able to interpret JSON-LD `@context` -
in this case a request is merely returning the full `tweets` attribute.

The same request is made by the context broker itself when querying for registered attributes

#### 7️⃣ Request:

```console
curl -L -X GET 'http://localhost:3000/static/tweets/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001?attrs=tweets' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Content-Type: application/ld+json'
```

#### Response:

As can be seen the `@context` has been returned in the request (since the `Content-Type` header was set). The rest of
the response resembles any standard NGSI-LD request.

```jsonld
{
    "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld",
    "id": "urn:ngsi-ld:Building:store001",
    "type": "Building",
    "tweets": {
        "type": "Property",
        "value": [
            "It has great practical value – you can wrap it around you for warmth as you bound across the cold moons of Jaglan Beta;",
            "You can lie on it on the brilliant marble-sanded beaches of Santraginus V, inhaling the heady sea vapours;",
            "You can sleep under it beneath the stars which shine so redly on the desert world of Kakrafoon;",
            "Use it to sail a mini raft down the slow heavy river Moth;",
            "Wet it for use in hand-to-hand-combat;",
            "Wrap it round your head to ward off noxious fumes or to avoid the gaze of the Ravenous Bugblatter Beast of Traal (a mindboggingly stupid animal, it assumes that if you can’t see it, it can’t see you – daft as a bush, but very, very ravenous);",
            "You can wave your towel in emergencies as a distress signal, and of course dry yourself off with it if it still seems to be clean enough."
        ]
    }
}
```

### Direct update of the Context Provider

For a read-write interface it is also possible to amend context data by making a PATCH request to the relevant
`ngsi-ld/v1/entities/<entity-id>/attrs` endpoint.

#### 8️⃣ Request:

```console
curl -L -X PATCH 'http://localhost:3000/static/tweets/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001/attrs' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Content-Type: application/json' \
--data-raw '{
  "tweets": {
    "type": "Property",
    "value": [
      "Space is big.",
      "You just won'\''t believe how vastly, hugely, mind-bogglingly big it is.",
      "I mean, you may think it'\''s a long way down the road to the chemist'\''s, but that'\''s just peanuts to space."
    ]
  }
}'
```

#### 9️⃣ Request:

If the regisitered attribute is requested from the context broker, it returns the _updated_ values obtained from
`http://tutorial:3000/static/tweets/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001` - i.e. the forwarding endpoint.

```console
curl -L -X GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001?attrs=tweets&options=keyValues' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
```

#### Response:

This alters the response to match the values updated in the previous PATCH request.

```jsonld
{
    "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld",
    "id": "urn:ngsi-ld:Building:store001",
    "type": "Building",
    "tweets": [
        "Space is big.",
        "You just won't believe how vastly, hugely, mind-bogglingly big it is.",
        "I mean, you may think it's a long way down the road to the chemist's, but that's just peanuts to space."
    ]
}
```

Since the context provider is responsible for supplying `tweets` information, changes in the context provider will
always be reflected in requests to the context-broker itself. The supermarket application is calling the context broker
for context regardless of origin, so the updated `tweets` data are displayed on screen within the supermarket
application itself:

![tweets-2](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/tweets-2.png)

The context broker is therefore able to return a complete holistic picture of the current state of the world.

### Forwarded Update

#### 1️⃣0️⃣ Request:

A PATCH request to the context broker ( either `ngsi-ld/v1/entities/<entity-id>/` or
`ngsi-ld/v1/entities/<entity-id>/attrs`) will be forwarded to the registered context provider if a registration is
found. It is therefore possible to alter the state of a context-provider as a side effect. Of course, not all context
providers are necessarily read-write, so attempting to change the attributes of forwarded context may not be fully
respected.

In this case however a request to PATCH `ngsi-ld/v1/entities/<entity-id>` will be successfully forwarded as a series of
`ngsi-ld/v1/entities/<entity-id>/attrs` requests for each regsitered attribute that is found in the registration.

```console
curl -L -X PATCH 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001/attrs/tweets' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Content-Type: application/json' \
--data-raw '{
  "type": "Property",
  "value": [
    "This must be Thursday",
    "I never could get the hang of Thursdays."
  ]
} '
```

#### 1️⃣1️⃣ Request:

The result of the previous operation can be seen by retrieving the whole entity using a GET request.

```console
curl -L -X GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Building:store001?attrs=tweets&options=keyValues' \
-H 'Link: <https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
-H 'Content-Type: application/json'
```

#### Response:

This alters the response to match the values updated in the previous PATCH request which was sent to the context broker
and then forwarded to the context provider endpoint.

```jsonld
{
    "@context": "https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld",
    "id": "urn:ngsi-ld:Building:store001",
    "type": "Building",
    "tweets": [
        "This must be Thursday",
        "I never could get the hang of Thursdays."
    ]
}
```

As can be seen, the updated `tweets` data is also displayed within the supermarket application itself:

![tweets-3](https://fiware.github.io/tutorials.LD-Subscriptions-Registrations/img/tweets-3.png)

---

## License

[MIT](LICENSE) © 2020-2023 FIWARE Foundation e.V.
