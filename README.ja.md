[![FIWARE Banner](https://fiware.github.io/tutorials.Context-Providers/img/fiware.png)](https://www.fiware.org/developers)

[![FIWARE Core Context Management](https://img.shields.io/badge/FIWARE-Core-233c68.svg?label=FIWARE&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAVCAYAAAC33pUlAAAABHNCSVQICAgIfAhkiAAAA8NJREFUSEuVlUtIFlEUx+eO+j3Uz8wSLLJ3pBiBUljRu1WLCAKXbXpQEUFERSQF0aKVFAUVrSJalNXGgmphFEhQiZEIPQwKLbEUK7VvZrRvbr8zzjfNl4/swplz7rn/8z/33HtmRhn/MWzbXmloHVeG0a+VSmAXorXS+oehVD9+0zDN9mgk8n0sWtYnHo5tT9daH4BsM+THQC8naK02jCZ83/HlKaVSzBey1sm8BP9nnUpdjOfl/Qyzj5ust6cnO5FItJLoJqB6yJ4QuNcjVOohegpihshS4F6S7DTVVlNtFFxzNBa7kcaEwUGcbVnH8xOJD67WG9n1NILuKtOsQG9FngOc+lciic1iQ8uQGhJ1kVAKKXUs60RoQ5km93IfaREvuoFj7PZsy9rGXE9G/NhBsDOJ63Acp1J82eFU7OIVO1OxWGwpSU5hb0GqfMydMHYSdiMVnncNY5Vy3VbwRUEydvEaRxmAOSSqJMlJISTxS9YWTYLcg3B253xsPkc5lXk3XLlwrPLuDPKDqDIutzYaj3eweMkPeCCahO3+fEIF8SfLtg/5oI3Mh0ylKM4YRBaYzuBgPuRnBYD3mmhA1X5Aka8NKl4nNz7BaKTzSgsLCzWbvyo4eK9r15WwLKRAmmCXXDoA1kaG2F4jWFbgkxUnlcrB/xj5iHxFPiBN4JekY4nZ6ccOiQ87hgwhe+TOdogT1nfpgEDTvYAucIwHxBfNyhpGrR+F8x00WD33VCNTOr/Wd+9C51Ben7S0ZJUq3qZJ2OkZz+cL87ZfWuePlwRcHZjeUMxFwTrJZAJfSvyWZc1VgORTY8rBcubetdiOk+CO+jPOcCRTF+oZ0okUIyuQeSNL/lPrulg8flhmJHmE2gBpE9xrJNkwpN4rQIIyujGoELCQz8ggG38iGzjKkXufJ2Klun1iu65bnJub2yut3xbEK3UvsDEInCmvA6YjMeE1bCn8F9JBe1eAnS2JksmkIlEDfi8R46kkEkMWdqOv+AvS9rcp2bvk8OAESvgox7h4aWNMLd32jSMLvuwDAwORSE7Oe3ZRKrFwvYGrPOBJ2nZ20Op/mqKNzgraOTPt6Bnx5citUINIczX/jUw3xGL2+ia8KAvsvp0ePoL5hXkXO5YvQYSFAiqcJX8E/gyX8QUvv8eh9XUq3h7mE9tLJoNKqnhHXmCO+dtJ4ybSkH1jc9XRaHTMz1tATBe2UEkeAdKu/zWIkUbZxD+veLxEQhhUFmbnvOezsJrk+zmqMo6vIL2OXzPvQ8v7dgtpoQnkF/LP8Ruu9zXdJHg4igAAAABJRU5ErkJgggA=)](https://www.fiware.org/developers/catalogue/)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Context-Providers.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)
[![NGSI v1](https://img.shields.io/badge/NGSI-v1-ff69b4.svg)](https://forge.fi-ware.org/docman/view.php/7/3213/FI-WARE_NGSI_RESTful_binding_v1.0.zip)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-blue.svg)](http://fiware.github.io/context.Orion/api/v2/stable/)

このチュートリアルでは、FIWARE ユーザにコンテキスト・データとコンテキスト・プロバイダについて説明しています。チュートリアルは、以前の[在庫管理の例](https://github.com/Fiware/tutorials.CRUD-Operations/)で作成された **Store** エンティティをベースにしていて、ユーザは、Orion Context Broker 内で直接保持されていないストアに関するデータを取得できます。

このチュートリアルでは、[cUrl](https://ec.haxx.se/)  コマンドを使用していますが、[Postman documentation](http://fiware.github.io/tutorials.Context-Providers/)  も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/7c9bed4bd2ce5213a80b)

# 内容

- [コンテキスト・データとコンテキスト・プロバイダ](#context-data-and-context-providers)
  * [在庫管理システム内のエンティティ](#entities-within-a-stock-management-system)
- [アーキテクチャ](#architecture)
- [前提条件](#prerequisites)
  * [Docker](#docker)
  * [Cygwin](#cygwin)
  * [コンテキスト・プロバイダ NGSI プロキシ](#context-provider-ngsi-proxy)
- [起動](#start-up)
- [コンテキスト・プロバイダの使用](#using-a-context-provider)
  * [ヘルスチェック](#health-checks)
    + [スタティック・データのコンテキスト・プロバイダ (ヘルスチェック)](#static-data-context-provider-health-check)
    + [ランダムデータのコンテキスト・プロバイダ (ヘルスチェック)](#random-data-context-provider-health-check)
    + [Twitter API のコンテキスト・プロバイダ (ヘルスチェック)](#twitter-api-context-provider-health-check)
    + [Weather API のコンテキスト・プロバイダ (ヘルスチェック)](#weather-api-context-provider-health-check)
  * [NGSI v1 QueryContext エンドポイントへのアクセス](#accessing-the-ngsi-v1-querycontext-endpoint)
    + [単一の属性値の取得](#retrieving-a-single-attribute-value)
    + [複数の属性値の取得](#retrieving-multiple-attribute-values)
  * [コンテキスト・プロバイダ登録アクション](#context-provider-registration-actions)
    + [新しいコンテキスト・プロバイダの登録](#registering-a-new-context-provider)
    + [登録されたコンテキスト・プロバイダの読み込み](#read-a-registered-content-provider)
    + [登録されているすべてのコンテキスト・プロバイダの一覧](#list-all-registered-content-providers)
    + [登録済みのコンテキスト・プロバイダの削除](#remove-a-registered-content-provider)
- [次のステップ](#next-steps)

<A name="context-data-and-context-providers"></A>
# コンテキスト・データとコンテキスト・プロバイダ

> "知識には二つのタイプがある。物事を知っているということ。もう一つはどこを探すべきかを知っているということ。"
>
> — Samuel Johnson (Boswell's Life of Johnson)


FIWARE プラットフォーム内では、エンティティは、実世界に存在する物理的または概念的オブジェクトの状態を表します。たとえば、**Store** は実際のレンガやモルタルの建物です。

そのエンティティのコンテキスト・データは、与えられた瞬間における実世界オブジェクトの状態を定義します。

これまでのチュートリアルでは、Orion Context Broker 内の **Store** エンティティのコンテキスト・データをすべて保持しています。たとえば、ストアには次のような属性があります :

* **id** : ストアの一意の識別子。たとえば、`urn:ngsi-ld:Store:002`
* **name** : ストアの名前。たとえば、"Checkpoint Markt"
* **address** :ストアの住所。たとえば、 "Friedrichstraße 44, 10969 Kreuzberg, Berlin"
* **location** : ストアの物理的な場所。たとえば、*52.5075 N, 13.3903 E*

ご覧のように、これらの属性のほとんどは完全に静的 (場所など) で、他のものは定期的に変更されることはありませんが、ストリートの名前を変更したり、ストアの名を変更することができます。

しかし、**Store** エンティティに関する別のクラスのコンテキスト・データがあります。これは、より動的な情報です。たとえば、次のような情報があります :

* **temperature** : ストアの現在の温度
* **relativeHumidity** : ストアの現在の相対湿度
* **tweets** : ストアに関する最近のソーシャルメディアのつぶやき

この情報は常に変化しており、静的にデータベースに保持されている場合、データは常に古くなります。コンテキスト・データを最新に保ち、オンデマンドでシステムの現在の状態を取得できるようにするには、エンティティのコンテキストがリクエストされるたびに、これらの動的データ属性の新しい値を取得する必要があります。

スマートなソリューションは、現実世界の現状に対応するように設計されています。ソーシャルメディア, IoTセンサー, ユーザ入力などの外部ソースからの動的なデータ読み取りに依存しているため、それらは "aware" (アウェア)です。FIWARE プラットフォームは、リアルタイム・コンテキスト・データの収集と提示を透過的にします。Orion Context Broker に対して [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) リクエストが行われるたびに、登録された外部コンテキスト・プロバイダからのリアルタイム・データ読み取りと一緒に、データベース内に保持されているデータを結合することによって常に最新のコンテキストを戻すからです。

Orion Context Broker は、これらのリクエストを満たすために、まず次の2種類の情報を提供する必要があります :

* Orion 自体で保持された静的コンテキスト・データ。 *Orion が知っている ("knows") エンティティ*
* 既存のエンティティに関連付けられた登録済みの外部コンテキストプロバイダ。*Orion が情報を見つけることができる ("find information" )エンティティ*

<A name="entities-within-a-stock-management-system"></A>
## 在庫管理システム内のエンティティ


私たちの簡単な在庫管理システムで、**Store** エンティティは、`id`, `name`, ` address` および `location` 属性を返します。我々は、以下の無料で公開されているのデータソースからのリアルタイムのコンテキスト・データを追加してこれを補強します :

* [Open Weather Map API](https://openweathermap.org/api) の温度と相対湿度
* [Twitter API](https://developer.twitter.com/) のストアに関する最近のソーシャルメディアのツイート

エンティティ間のリレーションシップは、次のように定義されます :

![](https://fiware.github.io/tutorials.Context-Providers/img/entities.png)


<A name="architecture"></A>
# アーキテクチャ

このアプリケーションは、[Orion Context Broker](https://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker) という1つの FIWARE コンポーネントしか使用しません。アプリケーションが *"Powered by FIWARE"* と認定するには、Orion Context Broker を使用するだけで十分です。

現在、Orion Context Broker はオープンソースの [MongoDB](https://www.mongodb.com/) 技術を利用して、コンテキスト・データの永続性を維持しています。外部ソースからコンテキスト・データをリクエストするには、単純なコンテキスト・プロバイダ NGSI プロキシを追加する必要があります。

したがって、アーキテクチャは3つの要素で構成されます :

* [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信する [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/)
* バックエンドの [MongoDB](https://www.mongodb.com/) データベース
  + Orion Context Broker が、データ・エンティティなどのコンテキスト・データ情報、サブスクリプション、登録などを保持するために使用します
* **コンテキスト・プロバイダ NGSI proxy** は次のようになります :
    + [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信する
    + 独自の API を独自のフォーマットで使用して、公開されているデータソースへのリクエストを行います
    + [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) 形式でコンテキスト・データを Orion Context Broker に返します

要素間のすべての対話は HTTP リクエストによって開始されるため、エンティティはコンテナ化され、公開されたポートから実行されます。

![](https://fiware.github.io/tutorials.Context-Providers/img/architecture.png)

**コンテキスト・プロバイダ NGSI proxy** に必要な設定情報は、関連する `docker-compose.yml` ファイルの services セクションにあります:

```yaml
  tutorial:
    image: fiware/tutorials.context-provider
    hostname: context-provider
    container_name: fiware-tutorial
    networks:
        - default
    expose:
        - "3000"
    ports:
        - "3000:3000"
    environment:
        - "DEBUG=tutorial:*"
        - "PORT=3000"
        - "CONTEXT_BROKER=http://orion:1026/v2"
        - "OPENWEATHERMAP_KEY_ID=<ADD_YOUR_KEY_ID>"
        - "TWITTER_CONSUMER_KEY=<ADD_YOUR_CONSUMER_KEY>"
        - "TWITTER_CONSUMER_SECRET=<ADD_YOUR_CONSUMER_SECRET>"
```

`tutorial` コンテナは以下のように環境変数によってドライブされます:

| Key |Value|Description|
|-----|-----|-----------|
|DEBUG|`tutorial:*`| ロギングに使用されるデバッグフラグです |
|WEB_APP_PORT|`3000`| データを表示するためにコンテキスト・プロバイダ NGSI proxy と Web アプリケーションで使用されるポート|
|CONTEXT_BROKER|`http://orion:1026/v2`| コンテキストを更新するために接続する Context Broker の URL |
|OPENWEATHERMAP_KEY_ID|`<ADD_YOUR_KEY_ID>`| Open Weather Map API へのアクセスを得るために使用されるコンシューマ・キー |
|TWITTER_CONSUMER_KEY|`<ADD_YOUR_CONSUMER_KEY>`| Twitter API へのアクセスを得るために使用されるコンシューマ・キー|
|TWITTER_CONSUMER_SECRET|`<ADD_YOUR_CONSUMER_SECRET>`| Twitter API へのアクセスを得るために使用されるユーザ・キー |

このチュートリアルでは、YAML ファイルに記述されている他の `tutorial` コンテナの設定値は使用していません。


MongoDB と Orion Context Broker の設定情報については、[以前のチュートリアル](https://github.com/Fiware/tutorials.Entity-Relationships/)で説明しました。

<A name="prerequisites"></A>
# 前提条件

<A name="docker"></A>
## Docker

物事を単純にするために、両方のコンポーネントは [Docker](https://www.docker.com) を使用して実行されます。**Docker** は、さまざまコンポーネントをそれぞれの環境に分離することを可能にするコンテナ・テクノロジです。

* Docker を Windows にインストールするには、[こちら](https://docs.docker.com/docker-for-windows/)の手順に従ってください
* Docker を Mac にインストールするには、[こちら](https://docs.docker.com/docker-for-mac/)の手順に従ってください
* Docker を Linux にインストールするには、[こちら](https://docs.docker.com/install/)の手順に従ってください

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです。[YAML file](https://raw.githubusercontent.com/Fiware/tutorials.Context-Providers/master/docker-compose.yml) ファイルは、アプリケーションのために必要なサービスを構成するために使用します。つまり、すべてのコンテナ・サービスは1つのコマンドで呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows と Docker for Mac の一部としてインストールされますが、Linux ユーザは[ここ](https://docs.docker.com/compose/install/)に記載されている手順に従う必要があります。

次のコマンドを使用して、現在の **Docker** バージョンと **Docker Compose** バージョンを確認できます :

```console
docker-compose -v
docker version
```

Docker バージョン 18.03 以降と Docker Compose 1.21 以上を使用していることを確認し、必要に応じてアップグレードしてください。

<A name="cygwin"></A>
## Cygwin

シンプルな Bash スクリプトを使用してサービスを開始します。Windows ユーザは [cygwin](http://www.cygwin.com/) をダウンロードして、Windows の Linux ディストリビューションに似たコマンドライン機能を提供する必要があります。

<A name="context-provider-ngsi-proxy"></A>
## コンテキスト・プロバイダ NGSI プロキシ

単純な [nodejs](https://nodejs.org/) [Express](https://expressjs.com/) アプリケーションが、リポジトリの一部としてバンドルされています。このアプリケーションは、4つの異なるコンテキスト・プロバイダに対してNGSI v1インターフェイスを提供します。Open Weather Map API, Twitter Search API と 、2つのダミーデータのコンテキスト・プロバイダである、いつも同じデータを返すスタティック・データのプロバイダと、呼び出されるたびに値が変わるランダム・データのコンテキスト・プロバイダです。

プロキシ・エンドポイントに関する詳細は、[こちら](https://github.com/Fiware/tutorials.Context-Providers/blob/master/proxy/README.md)を参照してください。

* Open Weather Map API にアクセスするには、<https://openweathermap.org/api> でキーを申請する必要があります
* Twitter Search API にアクセスするには、<https://apps.twitter.com/app/new> から Twitter でアプリを作成し 、コンシューマ・キーとコンシューマ・シークレットを取得する必要があります

`docker-compose.yml` のリポジトリのルートにあるプレースホルダを、アプリケーション用に取得した値に置き換えます :

```yaml
    environment:
        - "DEBUG=tutorial:*"
        - "CONTEXT_BROKER=http://orion:1026/v2"
        - "OPENWEATHERMAP_KEY_ID=<ADD_YOUR_KEY_ID>"
        - "TWITTER_CONSUMER_KEY=<ADD_YOUR_CONSUMER_KEY>"
        - "TWITTER_CONSUMER_SECRET=<ADD_YOUR_CONSUMER_SECRET>"
```

API キーにサインアップしたくない場合は、代わりにランダム・データ・コンテキスト・プロバイダのデータを使用できます。


<A name="start-up"></A>
# 起動

リポジトリ内で提供される bash スクリプトを実行すると、コマンドラインからすべてのサービスを初期化できます。リポジトリを複製し、以下のコマンドを実行して必要なイメージを作成してください :

```console
git clone git@github.com:Fiware/tutorials.Context-Providers.git
cd tutorials.Context-Providers

./services create; ./services start;
```

このコマンドは、起動時に以前の[在庫管理の例](https://github.com/Fiware/tutorials.CRUD-Operations)からシード・データをインポートします。

<A name="using-a-context-provider"></A>
# コンテキスト・プロバイダの使用

<A name="health-checks"></A>
## ヘルスチェック

nodejs proxy アプリケーションは、4つのコンテキスト・プロバイダのそれぞれに `health` エンドポイントを提供します。適切なエンドポイントにリクエストを行うと、プロバイダが実行中であり、外部データを受信できるかどうかがチェックされます。アプリケーションはポート `3000` で実行されます。


<A name="static-data-context-provider-health-check"></A>
### スタティック・データのコンテキスト・プロバイダ (ヘルスチェック)

この例では、スタティック・データのコンテキスト・プロバイダのエンドポイントの状態を返します。

エラーでないレスポンスの場合、NGSI プロキシがネットワーク上で利用可能であり、値を返すことを示しています。各リクエストは同じデータを返します。

#### :one: リクエスト :

```console
curl -X GET \
  'http://localhost:3000/health/static'
```

#### レスポンス :

```json
{
    "array": [
        "Arthur",
        "Dent"
    ],
    "boolean": true,
    "number": 42,
    "structuredValue": null,
    "text": "I never could get the hang of Thursdays"
}
```

<A name="random-data-context-provider-health-check"></A>
### ランダムデータのコンテキスト・プロバイダ (ヘルスチェック)

この例では、ランダム・データ・ジェネレータのコンテキスト・エンドポイントの正常性を返します。

エラーでないレスポンスの場合、NGSI プロキシがネットワーク上で利用可能であり、値を返すことを示しています。各リクエストはランダムなダミー・データを返します。

#### :two: リクエスト :

```console
curl -X GET \
  'http://localhost:3000/health/random'
```

#### レスポンス :

```json
{
    "array": [
        "sit", "consectetur", "sint", "excepteur"
    ],
    "boolean": false,
    "number": 4,
    "structuredValue": null,
    "text": " nisi reprehenderit pariatur. Aute ea"
}
```

<A name="twitter-api-context-provider-health-check"></A>
### Twitter API コンテキスト・プロバイダ (ヘルスチェック)

この例は、Twitter API コンテキスト・プロバイダのエンドポイントの正常性を返します。

エラーでないレスポンスの場合、NGSI プロキシがネットワーク上で利用可能であり、値を返すことを示しています。

プロキシが Twitter API に接続するように正しく設定されている場合は、一連のツイートが返されます。

Twitter API は OAuth2 を使用します :
* Twitter API のコンシューマ・キーとコンシューマ・シークレットを取得するには、<https://apps.twitter.com/app/new> からTwitter でアプリを作成する必要があります。その後、コンシューマ・キーとコンシューマ・シークレットを含むページに移動します
* 詳細は <https://developer.twitter.com/> を参照してください。

#### :three: リクエスト :

```console
curl -X GET \
  'http://localhost:3000/health/twitter'
```

#### レスポンス :

このレスポンスには、FIWARE に関する15のツイートが含まれます。完全なレスポンスはかなり長いですが、断片は以下のようなものです :

```json
{
	"statuses": [
	{
		"created_at": "Mon Apr 23 13:08:35 +0000 2018",
		"id": 988404265227038700,
		"id_str": "988404265227038721",
		"text": "@FIWARE: Full house today during the Forum Industrie 4.0 at @Hannover_Messe as #FIWARE Foundation CEO ...",
		"truncated": false,
		"entities": {
			... ETC
		},
		"metadata": {
	        ... ETC
	    }
	    ... ETC
	}
	... ETC

    ],
    "search_metadata": {
        "completed_in": 0.089,
        "max_id": 988407193497108500,
        "max_id_str": "988407193497108481",
        "next_results": "?max_id=988373340074242048&q=FIWARE&include_entities=1",
        "query": "FIWARE",
        "refresh_url": "?since_id=988407193497108481&q=FIWARE&include_entities=1",
        "count": 15,
        "since_id": 0,
        "since_id_str": "0"
    }

}
```

詳細から分かるように、各ツイートの `text`は、`statuses` 配列内にあります。

<A name="weather-api-context-provider-health-check"></A>
### Weather API コンテキスト・プロバイダ (ヘルスチェック)

この例では、スタティック・データのコンテキスト・プロバイダのエンドポイントの状態を返します。

エラーでないレスポンスの場合、NGSI プロキシがネットワーク上で利用可能であり、値を返すことを示しています。各リクエストは同じデータを返します。

#### :four: リクエスト :

```console
curl -X GET \
  'http://localhost:3000/health/weather'
```

#### レスポンス :

レスポンスには、ベルリンの現在の天気に関するデータが含まれます。完全なレスポンスはかなり長いですが、断片は以下のようなものです :

```json
{
  "coord": {
    "lon": 13.39,
    "lat": 52.52
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 299.64,
    "pressure": 1019,
    "humidity": 36,
    "temp_min": 299.15,
    "temp_max": 300.15
  },
  ...ETC
  "id": 2950159,
  "name": "Berlin",
  "cod": 200
}
```


ご覧のように、現在の温度と相対湿度の詳細は、 `current_observation` 属性内にあります。

<A name="accessing-the-ngsi-v1-querycontext-endpoint"></A>
## NGSI v1 QueryContext エンドポイントへのアクセス

コンテキスト・プロバイダの `3000` ポートは Docker コンテナの外部に公開されているため、curl はコンテキスト・プロバイダに直接リクエストを行うことができます。これは、Orion Context Broker によって行われたリクエストをシミュレートします。`appropriate/curl` の Docker イメージを実行することによって、Docker コンテナ・ネットワークの一部としてリクエストを作成することもシミュレートできます。

まず、Docker コンテナ内で使用されているネットワークの名前を取得します :

```console
docker network ls
```

次に、`--network` パラメータを含む次の `curl` コマンドを実行します :

```console
docker run --network fiware_default --rm appropriate/curl \
  -X GET 'http://context-provider:3000/health/random'
```

ご覧のとおり、ネットワーク内では、コンテキスト・プロバイダのホスト名は `context-provider` です。


<A name="retrieving-a-single-attribute-value"></A>
### 単一の属性値の取得

この例では、NGSI v1 `queryContext` エンドポイントを使用して、スタティック・データ・ジェネレータのコンテキスト・プロバイダから `temperature` の読み取りをリクエストします。リクエストされた属性は、POST ボディの `attributes` 配列内にあります。

Orion Context Broker は、コンテキスト・プロバイダが登録されると、この `queryContext` エンドポイントに同様のリクエストを行います。

#### :five: リクエスト :

```console
curl -iX POST \
  'http://localhost:3000/proxy/v1/static/temperature/queryContext' \
  -H 'Content-Type: application/json' \
  -d '{
    "entities": [
        {
            "type": "Store",
            "isPattern": "false",
            "id": "urn:ngsi-ld:Store:001"
        }
    ],
    "attributes": [
        "temperature"
    ]
} '
```

#### レスポンス :

レスポンスは NGSI v1 レスポンス形式で示されます。`attributes` 要素は、返されたデータの `value:42` を持つ `type:Number` オブジェクトを保持しています。

```json
{
    "contextResponses": [
        {
            "contextElement": {
                "attributes": [
                    {
                        "name": "temperature",
                        "type": "Number",
                        "value": 42
                    }
                ],
                "id": "urn:ngsi-ld:Store:001",
                "isPattern": "false",
                "type": "Store"
            },
            "statusCode": {
                "code": "200",
                "reasonPhrase": "OK"
            }
        }
    ]
}
```

<A name="retrieving-multiple-attribute-values"></A>
### 複数の属性値の取得

Orion Context Broker が複数のデータ値をリクエストすることは可能です。この例では、NGSI v1 `queryContext` エンドポイントを使用して、ランダム・データ・ジェネレータのコンテキスト・プロバイダから`temperature`と `relativeHumidity` の読み取りをリクエストします。リクエストされた属性は、POST ボディの `attributes` 配列内にあります。

#### :six: リクエスト :

```console
curl -iX POST \
  'http://localhost:3000/proxy/v1/random/weatherConditions' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 2ae9e6d6-802b-4a62-a561-5c7739489fb3' \
  -d '{
    "entities": [
        {
            "type": "Store",
            "isPattern": "false",
            "id": "urn:ngsi-ld:Store:001"
        }
    ],
    "attributes": [
        "temperature",
        "relativeHumidity"
    ]
}''
```

#### レスポンス :

レスポンスは NGSI v1 レスポンス形式で示されます。`attributes` 要素は、返されたデータを保持しています。

```json
{
    "contextResponses": [
        {
            "contextElement": {
                "attributes": [
                    {
                        "name": "temperature",
                        "type": "Number",
                        "value": 27
                    },
                    {
                        "name": "relativeHumidity",
                        "type": "Number",
                        "value": 21
                    }
                ],
                "id": "urn:ngsi-ld:Store:001",
                "isPattern": "false",
                "type": "Store"
            },
            "statusCode": {
                "code": "200",
                "reasonPhrase": "OK"
            }
        }
    ]
}
```

<A name="context-provider-registration-actions"></A>
## コンテキスト・プロバイダの登録アクション

すべてのコンテキスト・プロバイダの登録アクションは、`v2/registrations` エンドポイントで行われます。標準の CRUD マッピングが適用されます :

* Creation (作成) は HTTP POST にマップされます
* Reading/Listing (読み込み/一覧) は HTTP GET にマップされます
* Deletin (削除) は HTTP DELETE にマップされます

<A name="registering-a-new-context-provider"></A>
### 新しいコンテキスト・プロバイダの登録
この例では、ランダム・データのコンテキスト・プロバイダを Orion Context Broker に登録します。

リクエストのボディには、"URL  `http://context-provider:3000/proxy/v1/random/weatherConditions` は、 `id=urn:ngsi-ld:Store:001` と呼ばれるエンティティ の `relativeHumidity` と `temperature` データ を提供することができます" と記述します。

値は**決して**、 Orion 内に保持されず、登録されたコンテキスト・プロバイダからの要求に応じて常にリクエストされます。Orion は、どのコンテキスト・プロバイダがコンテキスト・データを提供できるかについての登録情報を保持するだけです。

`"legacyForwarding": true` フラグがあると、登録されたコンテキスト・プロバイダが NGSI v1 インターフェイスを提供していることを示します。したがって、Orion は、`http://context-provider:3000/proxy/v1/random/weatherConditions/queryContext` 形式のデータを POST でリクエストし、NGSI v1 形式のデータを受け取ります。

>*注* : Weather API に登録している場合、`provider` の中に 次の `url` を置くことで、Berlin の `temperature` と `relativeHumidity` のライブ値を取得することができます :
>
> * `http://context-provider:3000/proxy/v1/weather/weatherConditions`
>

このリクエストは、**201 - Created** レスポンス・コードとともに返されます。レスポンスの `Location` ヘッダには、Orion で保持されている登録レコードへのパスが含まれています :

#### :seven: リクエスト :

```console
curl -iX POST \
  'http://localhost:1026/v2/registrations' \
  -H 'Content-Type: application/json' \
  -d '{
  "description": "Relative Humidity Context Source",
  "dataProvided": {
    "entities": [
      {
        "id": "urn:ngsi-ld:Store:001",
        "type": "Store"
      }
    ],
    "attrs": [
      "relativeHumidity"
    ]
  },
  "provider": {
    "http": {
      "url": "http://context-provider:3000/proxy/v1/random/weatherConditions"
    },
     "legacyForwarding": true
  }
}'
```


コンテキスト・プロバイダが登録されると、`/entities/<entity-id>` エンドポイントを使用して、**Store** エンティティのコンテキスト `urn:ngsi-ld:Store:001` がリクエストされた場合、新しいコンテキスト・データがインクルードされます :

#### :eight: リクエスト :

```console
curl -X GET \
  'http://localhost:1026/v2/entities/urn:ngsi-ld:Store:001?type=Store'
```

#### レスポンス :

```json
{
    "id": "urn:ngsi-ld:Store:001",
    "type": "Store",
    "address": {
        "type": "PostalAddress",
        "value": {
            "streetAddress": "Bornholmer Straße 65",
            "addressRegion": "Berlin",
            "addressLocality": "Prenzlauer Berg",
            "postalCode": "10439"
        },
        "metadata": {}
    },
    "location": {
        "type": "geo:json",
        "value": {
            "type": "Point",
            "coordinates": [
                13.3986,
                52.5547
            ]
        },
        "metadata": {}
    },
    "name": {
        "type": "Text",
        "value": "Bösebrücke Einkauf",
        "metadata": {}
    },
    "temperature": {
        "type": "Number", "value": "22.6", "metadata": {}
    },
    "relativeHumidity": {
        "type": "Number",
        "value": "58%",
        "metadata": {}
    }
}
```


同様に、単一の属性は、 `/entities/<entity-id>/attrs/<attribute>` にリクエストすることで取得できます。

#### :nine: リクエスト :

```console
curl -X GET \
  'http://localhost:1026/v2/entities/urn:ngsi-ld:Store:001/attrs/relativeHumidity/value'
```

#### レスポンス :

```
"58%"
```

<A name="read-a-registered-content-provider"></A>
### 登録されたコンテキスト・プロバイダの読み込み

この例では、id が 5addeffd93e53f86d8264521 の登録データをコンテキストから読み込みます。

登録データは、`/v2/registrations/<entity>` エンドポイントに GET リクエストを行うことで取得できます。

#### :one::zero: リクエスト :


```console
curl -X GET \
  'http://localhost:1026/v2/registrations/5ad5b9435c28633f0ae90671'
```

<A name="list-all-registered-content-providers"></A>
### 登録されているすべてのコンテキスト・プロバイダの一覧

この例では、登録されているすべてのコンテキスト・プロバイダをリストします。

指定されたエンティティ・タイプの完全なコンテキスト・データは、`/v2/registrations/` エンドポイントに GET リクエストを行うことで取得できます。

#### :one::one: リクエスト :

```console
curl -X GET \
  'http://localhost:1026/v2/registrations'
```

#### レスポンス :

```json
[
    {
        "id": "5addeffd93e53f86d8264521",
        "description": "Random Weather Conditions",
        "dataProvided": {
            "entities": [
                {
                    "id": "urn:ngsi-ld:Store:002",
                    "type": "Store"
                }
            ],
            "attrs": [
                "temperature",
                "relativeHumidity"
            ]
        },
        "provider": {
            "http": {
                "url": "http://context-provider:3000/proxy/v1/random/weatherConditions"
            },
            "supportedForwardingMode": "all",
            "legacyForwarding": true
        },
        "status": "active"
    }
]
```

<A name="remove-a-registered-content-provider"></A>
### 登録済みのコンテキスト・プロバイダの削除

登録は、`/v2/registrations/<entity>`エンドポイントに DELETE リクエストを行うことによって削除できます。

```console
curl -iX DELETE \
  'http://localhost:1026/v2/registrations/5ad5b9435c28633f0ae90671'
```

<a name="next-steps"></a>
# 次のステップ

高度な機能を追加することで、アプリケーションに複雑さを加える方法を知りたいですか？このシリーズの[他のチュートリアル](https://www.letsfiware.jp/fiware-tutorials)を読むことで見つけることができます :




---

## License

[MIT](LICENSE) © FIWARE Foundation e.V.
