import BlogPostsCell from 'src/components/BlogPostsCell'
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags
        title="Home"
        description="This is the home page"
      />

      <h1>Redwood+Docker 🐳</h1>
      <BlogPostsCell />
    </>
  )
}

export default HomePage