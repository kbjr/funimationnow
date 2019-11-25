
#### Install

```bash
$ npm i --save @k/funimationnow
```

#### Usage

```typescript
import { FunimationApi } from '@k/funimationnow';

const api = new FunimationApi({
	territory: 'US'
});

// Login with user credentials
await api.login('username', 'password');

// Search for shows
const shows = await api.search('Fate');

// Get full details for a show
const fateZero = await api.getShowDetails(shows[0].id);

// ..... More to come .....
```







## Apendix: FunimationNow API Calls



#### Login

The actual authentication is _extremely_ simple (like, kind of insecure...). It seems that each user has a single, long-lived token assigned to them (by long lived, I mean they never expire). Every time you log in, you just get the same token back. Credentials (email/password) are sent in the payload of a POST request, and the token is sent back, along with some basic user info

##### Request

```http
POST /xml/auth/login/ HTTP/1.1
Host: prod-api-funimationnow.dadcdigital.com
Accept: */*
Content-Type: application/x-www-form-urlencoded

username=email_address_here&password=*********
```

##### Response

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




#### 


