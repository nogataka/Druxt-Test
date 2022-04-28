import merge from 'deepmerge'
import { DruxtClient } from 'druxt'
import { DruxtRouter } from 'druxt-router'
import { DruxtSchema } from 'druxt-schema'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CommonMeta from '../components/CommonMeta'
import marked from 'marked';

const baseUrl = 'https://panatech.c1x.biz/drupal9/'

function Route(ctx) {
  if(!ctx) {
    return (<div>NULL OBJ!</div>)
  }
  const router = useRouter()
  if (ctx.redirect) {
    useEffect(() => router.push(ctx.redirect))
    return (<p>Redirecting...</p>)
  }
  const { entity, schema } = ctx
  const { attributes, relationships } = entity.data

  return (<>
  <CommonMeta title="About" description="This is About page." />
    <div>
    <p><Link href={'/'}>HOME</Link></p>
    <div className="container-fluid">
      <h1>{attributes.title}</h1>
      <div className="row row-eq-height">
        <div className="card-base col-lg-3 col-sm-6 p-1">
        <div className="card">
        <div className="card-body">
        <div dangerouslySetInnerHTML={attributes.body && { __html: marked(attributes.body.value)}} />
        </div>
        </div>
        </div>
      </div></div></div>
  </>)
}


export async function getServerSideProps({ query, res }) {
  const token = 'cGFuYXNvbmljOnByb2N0b3Jz'
  
  const router = new DruxtRouter(baseUrl,{
      axios: {
        headers: {'X-Custom-Header': true,'Authorization': `Basic ${token}`},
      },
      endpoint: 'jsonapi'
  })
  const path = ((query || {}).path || []).join('/')
  const { redirect, route } = await router.get(`/${path}`)

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

  const { type, uuid } = route.props
  const [entityType, bundle] = type.split('--')

  const [entity, { schema }] = await Promise.all([
    druxt.getResource(type, uuid),
    druxtSchema.getSchema({ entityType, bundle })
  ])

  return { props: { entity, route, schema }}
}

export default Route
