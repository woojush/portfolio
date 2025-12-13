// Basic profile metadata and contact links for the hero section and other shared UI.

export interface ProfileLink {
  id: string;
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  tagline: string;
  links: ProfileLink[];
}

export const profile: Profile = {
  name: 'Shin Woo-Ju',
  tagline: 'AI와 삶을 함께 공부하는 2005년생 신우주입니다.',
  links: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/%EC%9A%B0%EC%A3%BC-%EC%8B%A0-346341344/'
    },
    {
      id: 'email',
      label: 'Email',
      href: 'mailto:tlsdntjr1121@naver.com'
    }
  ]
};




