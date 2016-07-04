Github Relat-or Website Overview
==============================================

This is the repository for the Github Relat-or website, currently available at
[http://github-relator.herokuapp.com/](http://github-relator.herokuapp.com/).

The Github Relat-or website is a website that allows you to see information about
a certain user and their code. Let's say you had a Github user named "mizchi" and the piece of code "debugger".
You could see how many times "debugger" appeared in all the committed code of "mizchi".
You could also know which repos the "debugger" popped up in for "mizchi" 
Additionally, you could see how many times "debugger" popped up in their followers.

Required Environment / Minimum Setup
----------------------------------------------

This app runs Ruby 2.3.0 and Rails 4.2.6.

It is backed by PostgreSQL and is hosted on Heroku.

Usage Information
----------------------------------------------

This app sends multiple queries simultaneously to Github API.
For more accurate results, this app requires the user to sign in
with their Github account.

Github Search API requires the user to sign in and be authenticated 
so that 30 requests can be made in 1 minute. If the user did not sign in
the API would only allow them a maximum of 10 requests per minute.

Accessing the site
----------------------------------------------

Go to http://github-relator.herokuapp.com/

and sign in with your Github account.

Walkthrough
----------------------------------------------

Installation should be fairly simple and consists of:

    $ git clone git@github.com:freddywong/github-relator.git
    $ bundle install
    $ cp .env.example .env
      # (I will need to send you the Github envvars. Ask me and I'll send it securely.)
    $ bundle exec rake db:setup
    $ bundle exec rails s

