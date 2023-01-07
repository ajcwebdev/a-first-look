export const QUERY = gql`
  query POSTS {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>
export const Empty = () => <div>Empty</div>
export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article key={post.id}>
      <header>
        <h2>{post.title}</h2>
      </header>

      <p>{post.body}</p>
      <time>{post.createdAt}</time>
    </article>
  ))
}