
### Install

```bash
$ npm i --save @k/funimationnow
```

### Usage

```typescript
import { FunimationApi } from '@k/funimationnow';

const api = new FunimationApi({
  territory: 'US'
});

// Login with user credentials
// `user.authentication.token` contains the auth token if you need to hold that for something
const user = await api.login('username', 'password');

// Search for shows
const shows = await api.search('Fate');

// Get full details for a show
const fateZero = await api.getShowDetails(shows[0].id);

// ..... More to come .....
```







## Apendix: FunimationNow API Calls

Note: All of the endpoint paths here end with a trailing slash (/). This is actually important. If you don't include it, you will always get back a 301 response, telling you try again with a trailing slash.



---

### Login

The actual authentication is _extremely_ simple (like, kind of insecure...). It seems that each user has a single, long-lived token assigned to them (by long lived, I mean they never expire). Every time you log in, you just get the same token back. Credentials (email/password) are sent in the payload of a POST request, and the token is sent back, along with some basic user info. Once you have a token, it passed back to the server as an `Authorization` header, prefixed with "Token " to authenticate requests:

```http
Authorization: Token ...
```

#### Request

```http
POST /xml/auth/login/ HTTP/1.1
Host: prod-api-funimationnow.dadcdigital.com
Accept: */*
Content-Type: application/x-www-form-urlencoded

username=email_address_here&password=*********
```

#### Response

```http
HTTP/1.1 200 OK
Allow: POST, OPTIONS
Content-Language: en
Content-Type: application/xhtml+xml
Date: Mon, 25 Nov 2019 03:11:09 GMT
Server: nginx
Set-Cookie: csrftoken=......; expires=Mon, 23-Nov-2020 03:11:09 GMT; Max-Age=31449600; Path=/
Set-Cookie: sessionid=......; expires=Tue, 26-Nov-2019 03:11:09 GMT; httponly; Max-Age=86400; Path=/
Vary: Cookie, Accept-Language
X-FRAME-OPTIONS: SAMEORIGIN
Content-Length: 542
Connection: keep-alive
Set-Cookie: incap_ses_726_894470=......; path=/; Domain=.dadcdigital.com
X-CDN: Incapsula
X-Iinfo: 14-39338901-39326001 PNNy RT(1574651467757 58) q(0 0 0 0) r(5 5) U6

<authentication>
  <token>Token ......</token>
  <anonymous>false</anonymous>
  <parameters>
    <header>
      <userName>email_address_here</userName>
      <userType>FunimationSubscriptionUser</userType>
      <userId>123456789</userId>
      <userRole>US Premium Plus Monthly - (US Premium Legacy)</userRole>
      <dinstid>......</dinstid>
      <Authorization>Token ......</Authorization>
    </header>
    <territory>US</territory>
  </parameters>
</authentication>
```




---

### Show Search

Searching for shows is fairly straight-forward, passing in a search query (like you might type into the search box in their UI), and you get back a list of matching results. The search query goes in the query string, in a parameter called `q`. Authentication doesn't seem to have any impact on the results of this query.


#### Request

```http
GET /xml/longlist/content/page/?id=search&q=fate HTTP/1.1
Host: prod-api-funimationnow.dadcdigital.com
Accept: */*
```

#### Response

```http
HTTP/1.1 200 OK
Content-Language: en
Content-Type: application/xhtml+xml
Date: Mon, 25 Nov 2019 21:38:48 GMT
Server: nginx
Vary: Accept-Language, Cookie
X-FRAME-OPTIONS: SAMEORIGIN
transfer-encoding: chunked
Connection: keep-alive
X-CDN: Incapsula
X-Iinfo: 5-69366219-69388309 PNNN RT(1574717811133 116730) q(0 0 0 -1) r(3 3) U12

<items>
  <item>
    .....
  </item>
  <item>
    .....
  </item>
  <item>
    .....
  </item>
</items>
```

The most interesting paths in the response are:

- `/items/item/id` - The show ID, needed to make further requests for more details
- `/items/item/title` - The title of the show
- `/items/item/thumbnail` - Various versions of the thumbnail image to display for the show
- `/items/item/starRating/rating` - The current star rating (out of 5) assigned to the show
- `/items/item/ratings` - The rating of the show (like TV-14) for various regions




---

### Get Show Details

To get further details about a show, you need the ID assigned to the show (such as from the search endpoint above). Authentication does seem to have an impact on what you get back from this endpoint, but I haven't dug in far enough to see what, exactly, is different. The core details do come back regardless of authentication.

The show ID goes in the query string, in the `pk` parameter.

#### Request

```http
GET /xml/detail/?territory=US&pk=29962 HTTP/1.1
Host: prod-api-funimationnow.dadcdigital.com
Accept: */*
Authorization: Token ......
```

#### Response

```http
HTTP/1.1 200 OK
Content-Language: en
Content-Type: application/xhtml+xml
Date: Mon, 25 Nov 2019 21:45:34 GMT
Server: nginx
Vary: Accept-Language, Cookie
X-FRAME-OPTIONS: SAMEORIGIN
transfer-encoding: chunked
Connection: keep-alive
X-CDN: Incapsula
X-Iinfo: 8-67658706-67657388 PNNy RT(1574718322750 10288) q(0 0 0 -1) r(19 19) U16

<list2d>
  <analytics>.....</analytics>
  <title>Detail</title>
  <logo>.....</logo>
  <themes>detail</themes>
  <hero>.....</hero>
  <pointer>.....</pointer>
  <pointer>.....</pointer>
</list2d>
```

In addition to the basic detail returned in the search endpoint, this endpoint's response also includes information about some of the episodes and related shows. It also includes the filter information that you can use to get to further episodes (which seasons are available, different versions of the show that are available, etc).

- `/list2d/pointer[0]/longList/palette/filter[*]` - Contains the various filters available for searching episodes, like season.
- `/list2d/pointer[0]/items[0]` - Contains the "watch next" information (ie, the next episode the given user has queued up)
- `/list2d/pointer[0]/items[1]/item[*]` - Contains the begining of the episode list (season 1?) to render an initial list from




---

### Get Episodes

To get a list of episodes, you need to know 2 things: the show ID, and what part of the show you want (eg. what season, etc). The available filters can be found in the show details endpoint, or they are also available in any payload from the get episodes endpoint (so you can request without filters, then make additional requests with filters to get more results). Authentication does seem to have an impact on what you get back from this endpoint, but I haven't dug in far enough to see what, exactly, is different. The core details do come back regardless of authentication.

The show ID goes in the query string, in the `show` parameter. Additional filters are also passed in the query string, under the parameter names listed in the payload.

#### Request

```http
GET /xml/longlist/episodes/?territory=US&show=37745 HTTP/1.1
Host: prod-api-funimationnow.dadcdigital.com
Accept: */*
Authorization: Token .....
```

#### Response

```http
HTTP/1.1 200 OK
Content-Language: en
Content-Type: application/xhtml+xml
Date: Mon, 25 Nov 2019 22:10:00 GMT
Server: nginx
Vary: Accept-Language, Cookie
X-FRAME-OPTIONS: SAMEORIGIN
transfer-encoding: chunked
Connection: keep-alive
X-CDN: Incapsula
X-Iinfo: 3-55901563-55923983 SNNy RT(1574719643708 156852) q(0 0 0 -1) r(3 3) U16

<longList>
  <background>.....</background>
  <themes>vertical</themes>
  <palette>
    <filter>.....</filter>
    <filter>.....</filter>
  </palette>
  <items>.....</items>
</longList>
```

- `/longList/background` - Contains background images to display when viewing the episode list
- `/longList/palette/filter[*]` - Contains the various filters available for searching episodes, like season.
- `/longList/items` - The episodes list
- `/longList/items/item[*]/thumbnail` - Contains the tumbnail images for the episode
- `/longList/items/item[*]/legend/filter` - Contains additional filters when playing this episode, like available audio languages
- `/longList/items/item[*]/pointer/params` - Contains the parameters needed to request the actual video
- `/longList/items/item[*]/content/description` - Contains the description for the episode
