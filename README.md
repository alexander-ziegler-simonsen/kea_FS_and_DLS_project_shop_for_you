# The Project 

The main project is a online shop like "nemlig.com".
We called it "ShopForYou"

# School Information

We are a group of 2 student from the "software developement" education.
We are from the 2025 spring first semester.

## Added Info 

This project is combinded with 2 courses, which are "Full Stack" (FS) and "Development of large system" (DLS).
2 students are connected from the DLS course, but only 1 are connected from the FS course.

## How To Run The Application
If you want to run the application with docker. All you need to do is fill out the env.tempalte file. You need an account on imgure, to make the application upload the images. (here is a guide how to make the application imgur: https://tome.oauth.io/create-imgur-application.Imgur)

If you want to run the application with kubernetes, then you need to fill out the configmap-template. Do the same with imgur from before and then run the folder kubernetes_mikkel. If it's you're first time you will need to run kubernetes-manual after the main application, to run the seeder. Some of the pods might start up too fast, so it's recommended to reload handlers (grocery_handler and order_handler) and mongo-sync-worker.
