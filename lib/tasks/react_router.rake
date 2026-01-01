namespace :react_router do
  desc "Build the React Router application"
  task :build do
    sh "cd frontend && pnpm run build:local"
    sh "rm -rf public/frontend"
    sh "mkdir -p public/frontend"
    sh "cp -r frontend/build/client/* public/frontend/"
    puts "✅ React Router application built and copied to public/frontend/"
  end

  desc "Remove the React Router build artifacts"
  task :clobber do
    sh "rm -rf public/frontend"
    puts "✅ React Router build artifacts removed"
  end

  desc "Start the React Router development server"
  task :dev do
    sh "cd frontend && pnpm run dev"
  end

  desc "Build and preview the React Router application"
  task :preview do
    Rake::Task["react_router:build"].invoke
    puts "✅ React Router application ready for preview at root path /"
  end
end

# Integrate with Rails asset pipeline
Rake::Task["assets:precompile"].enhance do
  Rake::Task["react_router:build"].invoke
end

Rake::Task["assets:clobber"].enhance do
  Rake::Task["react_router:clobber"].invoke
end
