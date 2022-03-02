import { render, screen, fireEvent } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubscribeButton } from '.'

jest.mock('next-auth/react')

jest.mock('next/router')

describe('SubscribeButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('redirects user to sign in when not authenticated', () => {
    const signInMocked = mocked(signIn)
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated'
    })

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects to posts when user already has subscription', () => {
    const useRouterMocked = mocked(useRouter)
    const useSessionMocked = mocked(useSession)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValue({
      data: {
        user: { name: 'John Doe', email: 'john.doe@example.com' },
        expires: 'fake-expires',
        activeSubscription: 'fake-active-subscription'
      },

      status: 'authenticated'
    })

    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(pushMock).toHaveBeenCalledWith('/posts')
  })
})
