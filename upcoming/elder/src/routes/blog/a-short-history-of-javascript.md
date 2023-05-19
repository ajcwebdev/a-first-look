---
title: 'a short history of javascript'
excerpt: 'JavaScript is multi-paradigm, dynamically typed programming language that supports first-class functions and prototypical object-orientation.'
coverImage: '/assets/blog/2020-04-20-javascript/a-short-history-of-javascript-cover.jpg'
date: '2020-04-20T00:00:00.000Z'
tags:
  - javascript
  - lamp
  - mean
  - jamstack
---

JavaScript is multi-paradigm, dynamically typed programming language that supports first-class functions and prototypical object-orientation. Along with HTML and CSS it is the underlying technology of the browser and the world wide web.

### LiveScript

Before JavaScript, web pages were static and lacked the capability for dynamic behavior after the page was loaded in the browser. In 1995, Netscape decided to add a scripting language to Navigator, the successor to the popular Mosaic browser.

To hedge their bets they pursued two routes: collaborating with Sun Microsystems to embed Java and hiring Brendan Eich to embed Scheme. After hiring Eich, Netscape decided that the best option was to devise a new language with syntax similar to Java to capitalize on its popularity.

The new language and its interpreter implementation were officially called LiveScript when first shipped as part of a Navigator release in September 1995. But the name was changed to JavaScript three months later.

The standard implementation of JavaScript today is known as ECMAScript due to the ongoing copyright disputes over the name. JavaScript has APIs for working with text, dates, regular expressions, data structures, and the Document Object Model (DOM).

### DOM

The Document Object Model is an object representation of an html document that serves as a programming interface to select and manipulate the page. The DOM can be used to change document structure, content, and styling. It creates and propagates event objects with information about event type and target.

[![Image](https://sedaily-topics.s3.amazonaws.com/topic_images/0_11140431928791017)](https://data-flair.training/blogs/javascript-dom/)

The object model is a tree structure with each DOM element in a tree node. When a web page is loaded, the browser first looks for the HTML file. The browser uses the HTML and CSS files as a blueprint to build the page. The browser parses these instructions and builds a model for how the page should look and act using Javascript.

### Events

Every user interaction with a site is an event: a click, moving the mouse, scrolling the page, pressing a key on the keyboard, etc. JavaScript allows us to add features and make modifications to our site by directly reacting to user interactions such as a button click, drag and drop, or zoom.

## JavaScript Everywhere

In the early days of web development many programmers using PHP, Perl, and Ruby looked down on JavaScript as a toy language. But as websites became more interactive JavaScript started to become the elephant in the room for every web developer.

Since JavaScript was the only language that ran in the browser, if a developer wanted to provide a high degree of client side interaction their only choice was to implement it in JavaScript.

A commonly held sentiment among some developers was that this was an unfortunate inconvenience of web development, and whenever possible code that could be written on the back end should be written on the back end.

But as web sites grew increasingly interactive, developers found it increasingly difficult, and illogical, to avoid writing JavaScript. Users wanted rich client side interactions. Instead of continuing to swim against the current some developers began to embrace this inevitability.

A new generation of technologies emerged that aimed to code their entire stack in JavaScript. In an attempt to create the worst marketing buzzword possible it was called isomorphic JavaScript. Others more sensibly called it "JavaScript everywhere," or as I like to say, "hella JavaScript."

### MEAN Stack

Ryan Dahl created NodeJS in 2009 because he was frustrated by Apache Server's inability to scale concurrent connections into the hundreds of thousands. He augmented Google's V8 Javascript engine with an event loop and input/output functionality.

That same year, AngularJS was created by Miško Hevery as the underlying framework behind an online JSON storage service.

MongoDB was also created around the same time as an internal component of 10gen's planned PaaS product. As the database started to gain traction it eventually became the sole focus of the company and. In 2013, they rebranded to Mongo Inc. MongoDB also leveraged JSON by providing a document schema instead of the dominant relational model.

The final piece came in 2010 when TJ Holowaychuk created a Sinatra inspired server framework for Node called Express.js that handled routing and middleware.

One of the first attempts to build a full stack solution with only JavaScript arrived in 2012 with Meteor.js, a framework that used Node and MongoDB. The next year Valeri Karpov coined a new term in an article published on MongoDB's blog, [The MEAN Stack: MongoDB, ExpressJS, AngularJS and Node.js](https://www.mongodb.com/blog/post/the-mean-stack-mongodb-expressjs-angularjs-and).

### Jamstack

The MEAN stack proved impractical for many developers due to the prohibitively large bundle size of Angular, the sprawling dependencies of Node, and the lack of ACID transactions in MongoDB.

[![Image](https://sedaily-topics.s3.amazonaws.com/topic_images/0_9599177836188364)](https://medium.com/memory-leak/the-jamstack-its-pretty-sweet-e0834e4e6bb7)

The Jamstack is a radical departure that attempts to serve static files from globally distributed CDN's, removing the server and the database from the stack entirely.

GraphQL API's are used as a glue layer for message passing between the CDN, 3rd party plugins, and users of your app. Lastly, markup can be used for creating websites, documents, notes, books, presentations, email messages, and technical documentation.