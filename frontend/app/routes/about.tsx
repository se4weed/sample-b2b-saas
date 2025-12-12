import type { Route } from "./+types/about";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "About - React Router App" }, { name: "description", content: "About page for React Router!" }];
}

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About Us</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Welcome to our Rails + React application! This is a modern web application built with the latest technologies to
              provide a seamless user experience.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology Stack</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Ruby on Rails 8.0 - Backend API</li>
              <li>React Router v7 - Frontend Framework</li>
              <li>TypeScript - Type Safety</li>
              <li>Tailwind CSS - Styling</li>
              <li>PostgreSQL - Database</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Server-side rendering with React Router</li>
              <li>Modern UI with responsive design</li>
              <li>Type-safe development experience</li>
              <li>Scalable architecture</li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
