# About BarathAI

BarathAI is a modern, professional, AI-powered web application designed for seamless chat, real-time collaboration, and efficient admin management. Built with React, TypeScript, and Supabase, BarathAI delivers a beautiful, responsive user experience with advanced features for both end-users and administrators. The platform emphasizes productivity, security, and a delightful UI, making it ideal for individuals and teams seeking a next-generation AI assistant and management tool.

# BarathAI Project Overview

This project is a modern, full-stack AI-powered web application. It is organized as follows:

## Project Structure

- **frontend (src/):**
  - Built with React and TypeScript.
  - Contains all user interface components, pages, and logic for interacting with Supabase (authentication, database, etc.).
  - Main features include:
    - User authentication (sign up, sign in, sign out)
    - Chat interface and chat session management
    - Admin portal for user and API management
    - Settings and personalization
    - Responsive, modern UI with glassmorphism and gradient themes

- **backend (backend/):**
  - Node.js project for optional server-side utilities (e.g., sending alert emails, admin scripts).
  - Not required for main app features, which are handled by Supabase and the frontend.

- **supabase/**
  - Contains Supabase configuration and database migrations.
  - Supabase provides authentication, database, and storage as a managed backend.

- **public/**
  - Static assets (images, icons, etc.) served by the frontend.

## Main Features
- User authentication (sign up, sign in, sign out)
- Real-time chat and session management
- Admin portal for user and API log management
- Professional, responsive UI
- Settings and personalization

## Not Included
- Password reset and recovery flows have been **completely removed** from this project. Users cannot reset their password via the app.

## How to Run
- Install dependencies and start the frontend (see package.json scripts).
- Backend utilities are optional and can be run separately if needed.
- Supabase must be configured and running for authentication and database features.
