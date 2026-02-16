import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import { useAuth } from '@/context/AuthContext';

// Mock del contexto de autenticación
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock de Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock de Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Navbar', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el logo de RopaBase', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  it('debería mostrar enlaces de login cuando no está autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('debería mostrar Log Out cuando está autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('debería llamar a logout cuando se hace clic en el botón Log Out', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('debería tener enlace a / en el logo de RopaBase', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    const ropabaseLink = screen.getByText('RopaBase');
    expect(ropabaseLink).toHaveAttribute('href', '/');
  });
});
