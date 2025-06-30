// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export default function () {
  // Open and close mobile nav
  const hamburgerButton = document.querySelector('.nav-mobile-burgerIcon')
  const mobileDropdown = document.querySelector('.nav-mobile-dropdown')

  if (!(hamburgerButton && mobileDropdown)) return

  hamburgerButton.addEventListener('click', (event) => {
    event.preventDefault()
    hamburgerButton.classList.toggle('js-open')
    mobileDropdown.classList.toggle('js-open')
  })
}
