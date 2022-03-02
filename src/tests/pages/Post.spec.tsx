import { render, screen } from '@testing-library/react'
import { getSession } from 'next-auth/react'
import { mocked } from 'ts-jest/utils'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
  slug: 'my-new-post',
  title: 'my new post',
  content: '<p>post excerpt</p>',
  updatedAt: '2 de março'
}

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText('my new post')).toBeInTheDocument()
    expect(screen.getByText('post excerpt')).toBeInTheDocument()
  })

  it('redurects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: '/',
          permanent: false
        }
      })
    )
  })

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession)
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'my new post' }],
          content: [{ type: 'paragraph', text: 'post content' }]
        },
        last_publication_date: '03-02-2022'
      })
    } as any)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-acttive-subscription'
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'my new post',
            content: '<p>post content</p>',
            updatedAt: '02 de março de 2022'
          }
        }
      })
    )
  })
})
