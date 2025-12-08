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
      id: 'email',
      label: 'Email',
      // TODO: 실제 이메일 주소로 변경하기 (mailto: 주소 포함)
      href: '#'
    },
    {
      id: 'github',
      label: 'GitHub',
      // TODO: 실제 GitHub 프로필 URL로 변경하기
      href: '#'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      // TODO: 실제 LinkedIn 프로필 URL로 변경하기
      href: '#'
    }
  ]
};




