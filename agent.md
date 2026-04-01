# Engineering Agent Guidelines (agent.md)

## 0. Purpose

This document defines **non-negotiable engineering principles** for any agent or developer contributing to this project.

Goal:

* Prevent short-term, greedy solutions
* Enforce long-term, production-grade design
* Maintain consistency, modularity, and resilience across the system

> Default assumption: the code will scale, be reused, and be maintained by others.

---

## 1. Core Philosophy

### 1.1 No Greedy Solutions

Never:

* Hardcode values
* Patch issues locally without understanding root cause
* Duplicate logic to “move faster”

Always:

* Generalize appropriately
* Abstract repeated patterns
* Design for reuse

---

### 1.2 Design for Change

Assume:

* Requirements will evolve
* UI will change
* APIs will expand

Code should be:

* Adaptable
* Extensible
* Easy to refactor

---

### 1.3 Clarity Over Cleverness

Prefer:

* Readable code
* Explicit logic

Avoid:

* Overly clever abstractions
* Hidden side effects

---

## 2. Modularity (Critical)

### 2.1 Separation of Concerns

Strict boundaries:

* UI (presentation)
* State management
* Business logic
* Data access

Never mix layers.

---

### 2.2 Component Design (Frontend)

Components must be:

* Small
* Reusable
* Stateless when possible

Guidelines:

* One responsibility per component
* No embedded business logic
* Use props/config instead of hardcoding

---

### 2.2.1 Surfaces & embedded UI (Panels, drawers, modals)

Avoid **nested “card” surfaces** inside an already elevated container (e.g. a bottom drawer tab already sits on a surface). 

---

### 2.3 API Design (Backend)

APIs must be:

* Consistent
* Predictable
* Versionable

Rules:

* No ad hoc endpoints
* Use clear resource naming
* Return structured, typed responses

---

### 2.4 Configuration-Driven System

Everything configurable:

* Colors
* Typography
* Feature flags
* App name, branding

No constants embedded in logic.

---

## 3. Theming & Design Tokens

All design values must come from:

* Central theme file
* Token system

Examples:

* `colors.primary`
* `spacing.md`
* `radius.lg`

Never:

* Use raw hex values in components
* Hardcode spacing or sizes

---

## 4. State Management

Principles:

* Single source of truth
* Minimal global state
* Predictable updates

Avoid:

* Hidden mutations
* Implicit coupling

Prefer:

* Explicit state transitions
* Immutable patterns

---

## 5. Error Handling & Resilience

### 5.1 Fail Gracefully

System should:

* Never crash the UI
* Degrade functionality cleanly

---

### 5.2 Explicit Error States

Every async operation must handle:

* Loading
* Success
* Error

---

### 5.3 Defensive Programming

Assume:

* Inputs may be invalid
* APIs may fail
* State may be inconsistent

Validate and guard accordingly.

---

## 6. Testing (Non-Negotiable)

### 6.1 Coverage Requirements

* Unit tests for logic
* Integration tests for flows
* End-to-end tests for critical paths

---

### 6.2 What to Test

Must test:

* Core logic
* Edge cases
* Failure modes

---

### 6.3 Determinism

Tests must be:

* Reliable
* Repeatable

No flaky tests.

---

## 7. Performance

### 7.1 Default to Efficient

Avoid:

* Unnecessary re-renders
* Blocking operations

---

### 7.2 Measure, Don’t Guess

Use:

* Profiling tools
* Metrics

---

## 8. Data & Types

### 8.1 Strong Typing

* Use strict typing everywhere
* Avoid `any`

---

### 8.2 Schema Enforcement

* Validate all external data
* Use schemas for APIs

---

## 9. Code Organization

### 9.1 Folder Structure

Organize by:

* Feature/domain

Not by:

* File type only

---

### 9.2 Naming

* Clear, descriptive names
* No abbreviations unless standard

---

## 10. Documentation

Code must be:

* Self-explanatory where possible
* Documented when non-obvious

Include:

* Function purpose
* Inputs/outputs

---

## 11. AI-Specific Guidelines

### 11.1 Avoid Shortcut Bias

Agents tend to:

* Choose easiest path
* Ignore long-term impact

Explicitly avoid this.

---

### 11.2 Always Ask:

* Is this reusable?
* Is this scalable?
* Will this break later?

If yes → redesign.

---

### 11.3 Refactor Proactively

If code smells:

* Fix it immediately
* Do not defer

---

## 12. Production Readiness

### 12.1 Logging

* Structured logs
* No sensitive data

---

### 12.2 Observability

* Metrics
* Tracing

---

### 12.3 Security

* Validate inputs
* Sanitize outputs

---

## 13. Final Principle


Every decision should reflect:

* Long-term thinking
* Clean design
* Engineering discipline

---

## TL;DR (Agent Checklist)

Before writing code:

* No hardcoding
* Use tokens/config
* Keep components modular
* Handle errors explicitly
* Write tests
* Think long-term

If unsure:

> Choose the design that scales, not the one that is fastest to write.
