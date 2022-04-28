import merge from 'deepmerge'
import { DruxtClient } from 'druxt'
import { DruxtRouter } from 'druxt-router'
import { DruxtSchema } from 'druxt-schema'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import CommonMeta from '../../components/CommonMeta'
import marked from 'marked';

//const baseUrl = 'https://demo-api.druxtjs.org'
//const baseUrl = 'http://192.168.1.77/drupal9/'
const baseUrl = 'https://panatech.c1x.biz/drupal9/'

function Route(ctx) {
  const router = useRouter()
  if (ctx.redirect) {
    useEffect(() => router.push(ctx.redirect))
    return (<p>Redirecting...</p>)
  }
  switch ((ctx.route || {}).type) {
    case 'entity': {
      const { entity, schema } = ctx
      const { attributes, relationships } = entity.data

      return (<>
      <CommonMeta title="About" description="This is About page." />
        <div>
        <p><Link href={'/home'}>HOME</Link></p>
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

    case 'views': {
      const { displayId, results, view } = ctx
      const { attributes } = view.data

      const display = displayId === 'default'
        ? attributes.display[displayId]
        : merge(attributes.display.default, attributes.display[displayId])

      return (<>
      <CommonMeta title="About" description="This is About page." />
        <div className="container-fluid">
          <h1>{attributes.label}</h1>
          <div className="row row-eq-height">
            {results.data.map(entity => (
            <div key={entity.id} className="card-base col-lg-3 col-sm-6 p-1">
            <div className="card">
            <div className="card-body">
            <p>{entity.attributes.title}</p>
            <p>{entity.type}</p>
            <p>{entity.id}</p>
            </div>
            <div className="card-footer">
            <Link href={'/drupal9'+entity.attributes.path.alias}>{entity.attributes.path.alias}</Link>
            </div>
            </div>
            </div>

            ))}
            </div>
            <dt>{/*Display options*/}</dt>
            <dd>{/*JSON.stringify(display)*/}</dd>
        </div>
        </>)
    }
  }

  return (<div>Error: Nothing here!</div>)
}

export async function getServerSideProps({ query, res }) {
  console.log("query1："+JSON.stringify(query))
  const token = 'cGFuYXNvbmljOnByb2N0b3Jz'
  
  const router = new DruxtRouter(baseUrl,{
      axios: {
        headers: {'X-Custom-Header': true,'Authorization': `Basic ${token}`},
      },
      endpoint: 'jsonapi'
  })
  const path = ((query || {}).path || []).join('/')
  console.log("path: "+path)
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

  return { props: { route } }
}

export default Route
