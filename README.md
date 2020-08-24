# dpkg-dependency-tracker

## Backend
- [x] dpkg package processing
- [x] Finding & adding reverse dependencies
- [x] API for getting packages + file upload
- [x] Backend refactoring
- [x] Fixing small parse errors
- [ ] Trim descriptions start/end, example: (Description: " query and manip...)

## Frontend 
- [x] Showing list of packages
- [x] Package details on selection
- [x] File Upload implementation
- [ ] Alerts for upload failure etc.

## Deployment
- [x] Kubernetes deployed
- [x] Basic deployment
- [x] Ingress config for routing
- [ ] TLS configured
- [ ] Scaling of frontend & backend

## General
- [x] This TODO list
- [X] Description for this project
- [ ] Install instructions

---
# DPKG Viewer

This application is used to parse & visualize relevant information out of a Debian package (DPKG) status file commonly found in a Debian-based linux distro. The application is publicly available at: http://dpkgviewer.westeurope.cloudapp.azure.com, where the user can not only view the [example dpkg status file](backend/storage/example-dpkg-data.txt), but also upload their own dpkg status file for processing.  

My goal was to provide a simple user experience with a minimal amount of external dependencies. I also considered my personal interests while selecting the tech stack, i.e. Next.js framework was something I had just heard about a few weeks before the start of this project and I was eager to give it a shot.  

## Features & Specification

### Backend - Node.js
- Fields, which are parsed:
  - name
  - description
  - dependencies
  - "reverse dependencies" for each package
- Express is used as a web server with endpoints:
  - POST /api/upload, to receive the file uploaded by the user from frontend
  - GET /api/packages, to provide initial example data at build time of frontend
- Multer used as a middleware for file upload
  - 2 Mb size limitation
  - .txt file ending validation
  - User uploaded file is removed after parsing the data 

### Frontend - React
- UI designed to be used with a computer, but scales nicely from small to ultra wide! 
- Next.js
  - Static Generated example page, which also pre-fetches data at build time
  - Client side data fetching used to get user uploaded package data from backend 
- tailwindcss
  - CSS framework with short and simple syntax for custom components

### Deployment
- Frontend and backend hosted at Azure Kubernetes Service
- Scalable design; Requests are load balanced across multiple backend/frontend pods
- Ingress configured to route /* path requests to frontend and /api/* to backend
- TLS configured for safe file uploads

## Usage

### Publicly available version
1. Visit http://dpkgviewer.westeurope.cloudapp.azure.com
2. Select "Upload a file" from the top center
3. Select the wanted DPKG status file
4. The UI updates and the Debian package content is visible! :sunrise:

### Local Docker
1. Run backend container at `http://localhost:5000` with: `docker run -p 5000:5000 arsenikki/dpkg-dep-tracker-backend:1.0.5`
2. Run frontend container at `http://localhost:3000` with: `docker run -p 3000:3000 arsenikki/dpkg-dep-tracker-frontend:1.0.8`
3. Visit http://localhost:3000
4. Select "Upload a file" from the top center
5. Select the wanted DPKG status file
6. The UI updates and the Debian package content is visible! :sunrise: