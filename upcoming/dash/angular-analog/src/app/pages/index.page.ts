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