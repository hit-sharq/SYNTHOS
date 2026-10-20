"use client"

import { useEffect, useRef, useState } from "react"
import { PageHead, PageWrap } from "@/components/app/Page"

export default function VueDemoPage() {
  const root = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!root.current || loaded || typeof window === "undefined") return
    if ((window as any).Vue) {
      mountVue()
      return
    }
    const script = document.createElement("script")
    script.src = "https://unpkg.com/vue@3/dist/vue.global.js"
    script.onload = () => {
      mountVue()
      setLoaded(true)
    }
    document.head.appendChild(script)
    return () => {
      try { document.head.removeChild(script) } catch {}
    }
  }, [loaded])

  const mountVue = () => {
    const { createApp, ref, computed } = (window as any).Vue
    const app = createApp({
      setup() {
        const count = ref(0)
        const doubled = computed(() => count.value * 2)
        const newTodo = ref("")
        const todos = ref([])
        const addTodo = () => {
          if (!newTodo.value.trim()) return
          todos.value.push(newTodo.value)
          newTodo.value = ""
        }
        const removeTodo = (index: number) => {
          todos.value.splice(index, 1)
        }
        return { count, doubled, newTodo, todos, addTodo, removeTodo }
      },
      template: `
        <div class="vue-demo">
          <div class="vue-card">
            <h2>Vue 3 + Next.js</h2>
            <p class="vue-note">Vue 3 Composition API running inside this Next.js (React) site.</p>

            <div class="vue-section">
              <h3>Reactive Counter</h3>
              <div class="vue-counter">
                <button @click="count--" class="vue-btn">−</button>
                <span class="vue-count">{{ count }}</span>
                <button @click="count++" class="vue-btn">+</button>
                <p class="vue-doubled">Doubled: {{ doubled }}</p>
              </div>
            </div>

            <div class="vue-section">
              <h3>Todo List</h3>
              <div class="vue-todo-input">
                <input v-model="newTodo" @keyup.enter="addTodo" placeholder="Add a task..." class="vue-input" />
                <button @click="addTodo" class="vue-btn">Add</button>
              </div>
              <ul class="vue-todos">
                <li v-for="(t, i) in todos" :key="i" class="vue-todo">
                  {{ t }}
                  <button @click="removeTodo(i)" class="vue-btn-remove">×</button>
                </li>
              </ul>
              <p v-if="!todos.length" class="vue-empty">No tasks yet.</p>
            </div>
          </div>
        </div>
      `
    })
    app.mount(root.current)
  }

  return (
    <PageWrap>
      <PageHead
        eyebrow="Vue.js"
        title="Vue 3 Demo"
        desc="A live Vue 3 Composition API demo mounted inside this Next.js site."
      />
      <div className="vue-wrap">
        <h2>Vue.js Demo</h2>
        <p>Vue 3 (Composition API) running inside this Next.js / React application.</p>
        <div ref={root} />
      </div>
      <style jsx>{`
        .vue-wrap { max-width: 640px; margin: 0 auto; padding: 24px; font-family: var(--font-sans), system-ui, sans-serif; }
        .vue-demo { font-family: inherit; }
        .vue-card { border: 1px solid var(--line); border-radius: 12px; padding: 24px; background: var(--surface); }
        .vue-note { font-size: 0.82rem; color: var(--ink-3); margin-bottom: 20px; }
        .vue-section { margin-bottom: 24px; }
        .vue-counter { display: flex; align-items: center; gap: 10px; }
        .vue-count { font-size: 2rem; font-variant-numeric: tabular-nums; min-width: 40px; text-align: center; }
        .vue-doubled { margin-top: 8px; font-size: 0.88rem; color: var(--ink-2); }
        .vue-todo-input { display: flex; gap: 8px; margin-bottom: 12px; }
        .vue-input { flex: 1; padding: 8px 12px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); border-radius: 6px; font-family: inherit; }
        .vue-todos { list-style: none; padding: 0; margin: 0; }
        .vue-todo { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; margin-bottom: 6px; background: var(--bg); }
        .vue-btn-remove { color: var(--rejected); background: transparent; border: none; cursor: pointer; font-size: 1.2rem; line-height: 1; padding: 0 4px; }
        .vue-btn-remove:hover { color: var(--rejected); text-decoration: underline; }
      `}</style>
    </PageWrap>
  )
}
