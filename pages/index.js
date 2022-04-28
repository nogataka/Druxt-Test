import merge from 'deepmerge'
import { DruxtClient } from 'druxt'
import { DruxtRouter } from 'druxt-router'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CommonMeta from '../components/CommonMeta'
import marked from 'marked';

const baseUrl = 'https://panatech.c1x.biz/drupal9/'

function Route(ctx) {
  const router = useRouter()
  if (ctx.redirect) {
    useEffect(() => router.push(ctx.redirect))
    return (<p>Redirecting...</p>)
  }

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
    </div>
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
  const { redirect, route } = await router.get("/")
  if (redirect) {
    return { props: { redirect } }
  }

  const druxt = new DruxtClient(baseUrl,{
    axios: {
      headers: {'X-Custom-Header': true,'Authorization': `Basic ${token}`},
    },
    endpoint: 'jsonapi'
  })

  const { displayId, type, uuid, viewId } = route.props
  const [view, results] = await Promise.all([
    druxt.getResource(type, uuid),
    druxt.getResource(`views--${viewId}`, displayId)
  ])
  return { props: { displayId, view, results, route } }
}

export default Route
