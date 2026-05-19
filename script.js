const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim())

const setText = (el, value) => {
  if (!el) return
  el.textContent = value
}

const setFieldError = (formEl, name, message) => {
  const holder = formEl.querySelector(`[data-error-for="${name}"]`)
  if (!holder) return
  holder.textContent = message || ""
}

const clearFieldErrors = (formEl) => {
  $$("[data-error-for]", formEl).forEach((el) => (el.textContent = ""))
}

const initYear = () => {
  const year = $("#year")
  if (year) year.textContent = String(new Date().getFullYear())
}

const initStickyHeader = () => {
  const header = $(".site-header")
  if (!header) return

  const onScroll = () => {
    const y = window.scrollY || 0
    header.classList.toggle("is-scrolled", y > 12)
  }

  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })
}

const initMobileNav = () => {
  const btn = $(".nav-toggle")
  const menu = $("#nav-menu")
  if (!btn || !menu) return

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", open ? "true" : "false")
    menu.classList.toggle("is-open", open)
    document.body.style.overflow = open ? "hidden" : ""
  }

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true"
    setOpen(open)
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setOpen(false)
  })

  $$("a", menu).forEach((link) => {
    link.addEventListener("click", () => setOpen(false))
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false)
  })
}

const initSmoothAnchors = () => {
  const links = $$('a[href^="#"]')
  links.forEach((a) => {
    const href = a.getAttribute("href") || ""
    if (href.length < 2) return
    a.addEventListener("click", (e) => {
      const id = href.slice(1)
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      const headerOffset = 82
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset
      window.scrollTo({ top: y, behavior: "smooth" })
      history.pushState(null, "", `#${id}`)
    })
  })
}

const initReveal = () => {
  const items = $$(".reveal")
  if (!items.length) return

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("is-visible")
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.12 }
  )

  items.forEach((el) => io.observe(el))
}

const initActiveNav = () => {
  const links = $$(".nav-link").filter((a) => (a.getAttribute("href") || "").startsWith("#"))
  const sections = links
    .map((a) => (a.getAttribute("href") || "").slice(1))
    .map((id) => document.getElementById(id))
    .filter(Boolean)

  if (!links.length || !sections.length) return

  const setActive = (id) => {
    links.forEach((a) => {
      const active = (a.getAttribute("href") || "") === `#${id}`
      a.classList.toggle("is-active", active)
    })
  }

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0]

      if (!visible) return
      setActive(visible.target.id)
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.2, 0.3, 0.4] }
  )

  sections.forEach((s) => io.observe(s))
}

const initTestimonials = () => {
  const root = $("[data-slider]")
  if (!root) return

  const track = $("[data-track]", root)
  const dotsWrap = $("[data-dots]", root)
  const prevBtn = $("[data-prev]", root)
  const nextBtn = $("[data-next]", root)
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return

  const slides = $$(".quote", track)
  if (!slides.length) return

  const dots = slides.map((_, idx) => {
    const b = document.createElement("button")
    b.type = "button"
    b.className = "dot-btn"
    b.setAttribute("aria-label", `Go to testimonial ${idx + 1}`)
    b.addEventListener("click", () => goTo(idx))
    dotsWrap.appendChild(b)
    return b
  })

  let index = 0
  let timer = null

  const update = () => {
    track.style.transform = `translateX(${-index * 100}%)`
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index))
  }

  const goTo = (next) => {
    index = (next + slides.length) % slides.length
    update()
    restart()
  }

  const restart = () => {
    if (timer) window.clearInterval(timer)
    timer = window.setInterval(() => goTo(index + 1), 6500)
  }

  prevBtn.addEventListener("click", () => goTo(index - 1))
  nextBtn.addEventListener("click", () => goTo(index + 1))

  root.addEventListener("mouseenter", () => {
    if (timer) window.clearInterval(timer)
  })
  root.addEventListener("mouseleave", restart)

  update()
  restart()
}

const bmiConfig = {
  unit: "metric",
  ranges: [
    { max: 18.4, label: "Underweight", color: "rgba(243, 201, 77, 0.16)" },
    { max: 24.9, label: "Normal", color: "rgba(47, 224, 155, 0.14)" },
    { max: 29.9, label: "Overweight", color: "rgba(243, 201, 77, 0.16)" },
    { max: Infinity, label: "Obesity", color: "rgba(255, 63, 95, 0.16)" },
  ],
}

const parsePositiveNumber = (value) => {
  const n = Number(String(value).trim().replace(",", "."))
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

const bmiCalculate = (unit, height, weight) => {
  if (unit === "metric") {
    const hM = height / 100
    return weight / (hM * hM)
  }

  return (703 * weight) / (height * height)
}

const bmiTip = (bmi) => {
  if (bmi < 18.5) return "Prioritize strength training and a calorie surplus with quality protein. Start with 3 full-body days."
  if (bmi < 25) return "Great baseline. Focus on progressive overload, daily steps, and sleep consistency to stay strong."
  if (bmi < 30) return "A small calorie deficit + strength training works well. Add 8–10k steps daily and track weekly."
  return "Start gently: 3 strength sessions/week + daily walking. Consistency beats intensity in the first month."
}

const bmiCategory = (bmi) => bmiConfig.ranges.find((r) => bmi <= r.max) || bmiConfig.ranges[bmiConfig.ranges.length - 1]

const initBmi = () => {
  const form = $("#bmi-form")
  if (!form) return

  const heightEl = $("#bmi-height")
  const weightEl = $("#bmi-weight")
  const heightUnitEl = $("#bmi-height-unit")
  const weightUnitEl = $("#bmi-weight-unit")
  const scoreEl = $("#bmi-score")
  const badgeEl = $("#bmi-badge")
  const tipEl = $("#bmi-tip")

  const setUnit = (unit) => {
    bmiConfig.unit = unit
    const toggles = $$(".toggle-btn", form)
    toggles.forEach((btn) => {
      const active = btn.dataset.unit === unit
      btn.classList.toggle("is-active", active)
      btn.setAttribute("aria-selected", active ? "true" : "false")
    })

    if (heightUnitEl) heightUnitEl.textContent = unit === "metric" ? "cm" : "in"
    if (weightUnitEl) weightUnitEl.textContent = unit === "metric" ? "kg" : "lb"

    if (heightEl) heightEl.placeholder = unit === "metric" ? "e.g. 175" : "e.g. 70"
    if (weightEl) weightEl.placeholder = unit === "metric" ? "e.g. 72" : "e.g. 165"

    clearFieldErrors(form)
    setText(scoreEl, "--")
    setText(badgeEl, "Enter values")
    if (badgeEl) {
      badgeEl.style.background = "rgba(255, 255, 255, 0.05)"
      badgeEl.style.borderColor = "rgba(255, 255, 255, 0.14)"
    }
    setText(tipEl, "Tip: Strength training + daily steps is a powerful baseline for most body composition goals.")
  }

  $$(".toggle-btn", form).forEach((btn) => {
    btn.addEventListener("click", () => setUnit(btn.dataset.unit || "metric"))
  })

  const validate = () => {
    clearFieldErrors(form)
    const height = parsePositiveNumber(heightEl?.value || "")
    const weight = parsePositiveNumber(weightEl?.value || "")

    let ok = true
    if (!height) {
      setFieldError(form, "height", "Enter a valid height.")
      ok = false
    }
    if (!weight) {
      setFieldError(form, "weight", "Enter a valid weight.")
      ok = false
    }

    if (ok) {
      if (bmiConfig.unit === "metric" && (height < 80 || height > 260)) {
        setFieldError(form, "height", "Height should be between 80–260 cm.")
        ok = false
      }
      if (bmiConfig.unit === "imperial" && (height < 36 || height > 100)) {
        setFieldError(form, "height", "Height should be between 36–100 inches.")
        ok = false
      }
      if (bmiConfig.unit === "metric" && (weight < 20 || weight > 300)) {
        setFieldError(form, "weight", "Weight should be between 20–300 kg.")
        ok = false
      }
      if (bmiConfig.unit === "imperial" && (weight < 44 || weight > 660)) {
        setFieldError(form, "weight", "Weight should be between 44–660 lb.")
        ok = false
      }
    }

    return { ok, height, weight }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const { ok, height, weight } = validate()
    if (!ok || height == null || weight == null) return

    const raw = bmiCalculate(bmiConfig.unit, height, weight)
    const bmi = clamp(raw, 10, 60)
    const cat = bmiCategory(bmi)

    setText(scoreEl, bmi.toFixed(1))
    setText(badgeEl, cat.label)
    setText(tipEl, bmiTip(bmi))

    if (badgeEl) {
      badgeEl.style.background = cat.color
      badgeEl.style.borderColor = "rgba(255, 255, 255, 0.12)"
    }
  })

  setUnit("metric")
}

const initContactForm = () => {
  const form = $("#contact-form")
  if (!form) return

  const success = $("#contact-success")
  const btn = $("button[type='submit']", form)

  const getValue = (name) => String(($(`[name="${name}"]`, form) || {}).value || "").trim()

  const validate = () => {
    clearFieldErrors(form)
    let ok = true

    const name = getValue("name")
    const email = getValue("email")
    const goal = getValue("goal")
    const message = getValue("message")

    if (name.length < 2) {
      setFieldError(form, "name", "Enter your full name.")
      ok = false
    }
    if (!isEmail(email)) {
      setFieldError(form, "email", "Enter a valid email.")
      ok = false
    }
    if (!goal) {
      setFieldError(form, "goal", "Select a goal.")
      ok = false
    }
    if (message.length < 10) {
      setFieldError(form, "message", "Add a short message (at least 10 characters).")
      ok = false
    }

    return { ok, name, email, goal, message }
  }

  const setLoading = (loading) => {
    if (!btn) return
    btn.disabled = loading
    btn.classList.toggle("is-loading", loading)
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    setText(success, "")
    const res = validate()
    if (!res.ok) return

    setLoading(true)
    await new Promise((r) => window.setTimeout(r, 800))
    setLoading(false)

    form.reset()
    setText(success, "Message sent. We’ll reach out within 24 hours with your trial details.")
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initYear()
  initStickyHeader()
  initMobileNav()
  initSmoothAnchors()
  initReveal()
  initActiveNav()
  initTestimonials()
  initBmi()
  initContactForm()
})

