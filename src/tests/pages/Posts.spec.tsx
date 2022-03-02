import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

const posts = [
  {
    slug: 'my-new-post',
    title: 'my new post',
    excerpt: 'post excerpt',
    updatedAt: '2 de março'
  }
]

jest.mock('../../services/prismic')

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('my new post')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [
                {
                  type: 'heading',
                  text: 'my new post'
                }
              ],
              content: [
                {
                  type: 'paragraph',
                  text: 'post excerpt'
                }
              ]
            },
            last_publication_date: '03-02-2022'
          }
        ]
      })
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-new-post',
              title: 'my new post',
              excerpt: 'post excerpt',
              updatedAt: '02 de março de 2022'
            }
          ]
        }
      })
    )
  })
})
