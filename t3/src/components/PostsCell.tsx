import { DefaultQueryCell } from "../utils/DefaultQueryCell"
import { styles } from "../styles/styles"
import Link from "next/link"
import { trpc } from "../utils/trpc"

const {
  blogHeader, blogLink
} = styles

type BlogPostProps = {
  id: string
  title: string
}

export default function PostsCell() {
  const postsQuery = trpc.useQuery([
    'post.all'
  ])

  return (
    <>
      <h2 className={blogHeader}>
        Posts
      </h2>

      {postsQuery.status === 'loading'}

      <DefaultQueryCell
        query={postsQuery}
        success={({ data }: any) => (
          data.map(({id, title}: BlogPostProps) => (
            <Link key={id} href={`/post/${id}`}>
              <p className={blogLink}>
                {title}
              </p>
            </Link>
          ))
        )}
        empty={() => <p>WE NEED POSTS!!!</p>}
      />
    </>
  )
}