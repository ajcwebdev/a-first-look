import { styles } from "../styles/styles"

const {
  cardSection, cardTitle, link
} = styles

type CardProps = {
  name: string
  url: string
}

export default function Card({
  name, url
}: CardProps) {
  return (
    <a href={`https://${url}`} target="_blank" rel="noreferrer">
      <section className={cardSection}>
        <h2 className={cardTitle}>
          {name}
        </h2>

        <span className={link}>
          {url}
        </span>
      </section>
    </a>
  )
}