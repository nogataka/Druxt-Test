import merge from 'deepmerge'
import { DruxtClient } from 'druxt'
import { DruxtRouter } from 'druxt-router'
import { DruxtSchema } from 'druxt-schema'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import CommonMeta from '../components/CommonMeta'
import marked from 'marked';

//const baseUrl = 'https://demo-api.druxtjs.org'
//const baseUrl = 'http://192.168.1.77/drupal9/'
const baseUrl = 'https://panatech.c1x.biz/drupal9/'

export async function getServerSideProps({ query, res }) {
  console.log("query2："+JSON.stringify(query))
  const token = 'cGFuYXNvbmljOnByb2N0b3Jz'
  
  const router = new DruxtRouter(baseUrl,{
      axios: {
        headers: {'X-Custom-Header': true,'Authorization': `Basic ${token}`},
      },
      endpoint: 'jsonapi'
  })
  const path = ((query || {}).path || []).join('/')
  const { redirect, route } = await router.get(`/${path}`)

  //console.info(`/${path}`)
  console.log(`/${path}`)
  if (redirect) {
    return { props: { redirect } }
  }

  const druxt = new DruxtClient(baseUrl,{
    axios: {
      headers: {'X-Custom-Header': true,'Authorization': `Basic ${token}`},
    },
    endpoint: 'jsonapi'
  })
  const druxtSchema = new DruxtSchema(baseUrl,{
    axios: {
      headers: {'X-Custom-Header': true,'Authorization': `Basic ${token}`},
    },
    endpoint: 'jsonapi'
  })

  switch (route.type) {
    case 'entity': {
      const { type, uuid } = route.props
      const [entityType, bundle] = type.split('--')

      const [entity, { schema }] = await Promise.all([
        druxt.getResource(type, uuid),
        druxtSchema.getSchema({ entityType, bundle })
      ])

      return { props: { entity, route, schema }}
    }

    case 'views': {
      const { displayId, type, uuid, viewId } = route.props
      const [view, results] = await Promise.all([
        druxt.getResource(type, uuid),
        druxt.getResource(`views--${viewId}`, displayId)
      ])
      return { props: { displayId, view, results, route } }
    }
  }
  console.info('OKOKOK')
  return { props: { route } }
}
export default function Home(ctx) {
  switch ((ctx.route || {}).type) {
    case 'views': {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className="grid">
          <a href="https://nextjs.org/docs" className="card">
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className="card">
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className="card"
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className="card"
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>
    </div>
  )
  }
}
}
