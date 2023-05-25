# Analog App

This project was generated with [Analog](https://analogjs.org), the fullstack meta-framework for Angular.

## Setup

```bash
npm i
npm start
```

- Run `npm install` to install the application dependencies.
- Run `npm start` for a dev server. Navigate to `http://localhost:5173/`. The application automatically reloads if you change any of the source files.
- Run `npm run build` to build the client/server project. The client build artifacts are located in the `dist/analog/public` directory. The server for the API build artifacts are located in the `dist/analog/server` directory.

```bash
curl "http://localhost:5173/api/v1/hello"
```

```json
{
  "message": "Hello World"
}
```

```ts
// src/app/pages/index.page.ts

import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <h1>Dash + Angular/Analog + Express</h1>
    <button (click)="fetchData()">Fetch Data</button>
    <pre class="alignLeft">
      <p class="preLeft">
        {{isLoading ? 'Loading...' : blockchainData}}
      </p>
    </pre>
  `,
  styles: [`
    .alignLeft {
      display: flex;
      justify-content: flex-start;
    }
    .preLeft {
      text-align: left;
    }`,
  ],
})

export default class HomeComponent {
  blockchainData: any
  isLoading = false

  constructor(private http: HttpClient) {}

  fetchData() {
    this.isLoading = true
    this.http.get('http://localhost:3001/name/ajcwebdevtest').subscribe(
      data => {
        this.blockchainData = JSON.stringify(data, null, 2)
        this.isLoading = false
      },
      error => {
        console.error(error)
        this.isLoading = false
      }
    )
  }
}
```