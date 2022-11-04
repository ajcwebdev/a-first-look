import { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getServerSession } from "next-auth"
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]"

const restricted = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions)

  if (session) {
    res.send({
      content: "You can access this protected content because you are signed in."
    })
  } else {
    res.send({
      error: "You must be signed in to view the protected content on this page."
    })
  }
}

export default restricted