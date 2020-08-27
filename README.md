# DPKG Viewer

This application is used to parse & visualize relevant information out of a Debian package (DPKG) status file commonly found in a Debian-based linux distro. The application is publicly available [right here](http://dpkgviewer.westeurope.cloudapp.azure.com), where the user can not only view the visually pleasing version of [example dpkg status file](backend/storage/example-dpkg-data.txt), but also upload their own dpkg status file.  

My goal was to provide a simple user experience with a minimal amount of external dependencies. I also considered my personal interests while selecting the tech stack, i.e. Next.js framework was something I had just heard about a few weeks before the start of this project and I was eager to give it a shot.  

## Features & Specification

### Backend - Node.js
- Fields, which are parsed:
  - Name
  - Description
  - Dependencies
  - Reverse dependencies for each package
- Express is used as a web server with endpoints:
  - POST /api/upload, to receive the file uploaded by the user from frontend
  - GET /api/packages, to provide initial example data at build time of frontend
- Multer used as a middleware for file upload
  - 2 Mb size limitation
  - .txt file ending supported
  - File uploaded by the user is removed after parsing the data 

### Frontend - React
- UI designed to have most of the content visible on a single view, but scrollbars are visible when needed.
- Next.js
  - Static Generated example page, which also pre-fetches data at build time
  - Client side data fetching used to get user uploaded package data from backend 
- tailwindcss
  - CSS framework with short and simple syntax for custom components

### Deployment
- Frontend and backend hosted at Azure Kubernetes Service
- External load balancer for user traffic
- Scalable design; Requests are load balanced across 3 replicas of both backend & frontend
- Ingress configured to route /* path requests to frontend and /api/* to backend
- TLS configured for safe file uploads

## Usage

### Publicly available version
1. Visit http://dpkgviewer.westeurope.cloudapp.azure.com
2. Select "Upload a file" from the top center
3. Select the wanted DPKG status file
4. The UI updates and the Debian package information is shown! :sunrise:

### Run in a local environment with Docker
1. Run `docker-compose up` from the project root folder
3. The application frontend now runs at: http://localhost:3000, and backend at http://localhost:5000
4. Select "Upload a file" from the top center
5. Select the wanted DPKG status file
6. The UI updates and the Debian package information is shown! :sunrise:
7. Close the application with `docker-compose down`