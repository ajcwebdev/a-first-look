import Head from 'next/head'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import styles from '../styles/Home.module.css'

export default function Home({ posts }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Redwood+Next</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Redwood+Next ▲</h1>

        <div>
          {posts.map(post => {
            return (
              <ul key={post.id}>
                <li>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </li>
              </ul>
            );
          })}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const client = new ApolloClient({
    uri: 'https://redwood-next.vercel.app/api/graphql',
    cache: new InMemoryCache()
  });

  const { data } = await client.query({
    query: gql`
      query GetPosts {
        posts {
          id
          title
          body
        }
      }
    `
  });

  return {
    props: {
      posts: data.posts
    }
  }
}