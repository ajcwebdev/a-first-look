import { useRouter } from "next/router"
import Head from "next/head"
import { DefaultQueryCell } from "../../utils/DefaultQueryCell"
import { trpc } from "../../utils/trpc"
import { styles } from "../../styles/styles"

const {
  blogContainer, blogTitle, blogBody
} = styles

export default function PostPage() {
  const id = useRouter().query.id as string
  const postQuery = trpc.useQuery([
    'post.byId', { id }
  ])

  return (
    <DefaultQueryCell
      query={postQuery}
      success={({ data }) => (
        <>
          <Head>
            <title>{data.title}</title>
            <meta name="description" content={data.description} />
          </Head>

          <main className={blogContainer}>
            <h1 className={blogTitle}>{data.title}</h1>
            <p className={blogBody}>{data.body}</p>
            <em>Created {data.createdAt.toLocaleDateString()}</em>
          </main>
        </>
      )}
    />
  )
}