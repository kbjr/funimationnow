
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
