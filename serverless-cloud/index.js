import { api, data, schedule, params } from '@serverless/cloud'

api.get('/todos', async (req, res) => {
  let result = await getTodos(
    req.query.status,
    req.query.meta ? true : {}
  )
  
  console.log(params.CLOUD_URL)

  res.send({
    items: result.items
  })
})

api.post('/todos/:id', async (req, res) => {
  console.log(new Date().toISOString())

  let body = req.body
  if (body.duedate) {
    body.duedate = new Date(body.duedate).toISOString()
  }

  await data.set(
    `todo:${req.params.id}`,
    {
      ...body,
      createdAt: Date.now()
    },
    Object.assign({},
      req.body.status ? 
        { 
          label1: body.status === 'complete'
            ? `complete:${new Date().toISOString()}` 
            : `incomplete:${body.duedate ? body.duedate : '9999' }` }
        : null
    )
  )
  
  let result = await getTodos(
    req.query.status
  )

  res.send({
    items: result.items
  })
})

api.delete('/todos/:id', async (req, res) => {
  await data.remove(`todo:${req.params.id}`)
  
  let result = await getTodos(req.query.status)

  res.send({
    items: result.items
  })
})

api.use((err, req, res, next) => {
  console.error(err.stack)

  if (!err.statusCode) {
    err.statusCode = 500
  }

  const error = {
    name: err.name,
    statusCode: err.statusCode,
    message: err.message,
  }

  res.status(err.statusCode).json(error)
})

schedule.every("60 minutes", async () => {
  console.log(`Checking for overdue TODOs...`)

  let overdueItems = await data.getByLabel('label1',`incomplete:<${new Date().toISOString()}`)

  if (overdueItems.items.length === 0) {
    console.log(`Nothing overdue!`)
  }

  for (let item of overdueItems.items) {
    console.log(`ALERT: '${item.value.name}' is overdue!!!`)
  }
})


const getTodos = async (status, meta) => {
  let result
  if (status === 'all') {
    result = await data.get('todo:*', meta)
  } else if (status === 'complete') {
    result =  await data.getByLabel('label1','complete:*', meta)
  } else {
    result = await data.getByLabel('label1','incomplete:*', meta)
  }

  return {
    items: result.items.map(
      item => item.value
    )
  }
}
