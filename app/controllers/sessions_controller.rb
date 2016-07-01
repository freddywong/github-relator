class SessionsController < ApplicationController   
  def create     
    auth = request.env["omniauth.auth"]     
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.create_with_omniauth(auth)     
    session[:user_id] = user.id
    session[:access_token] = auth.credentials.token  
    redirect_to pages_search_path, :notice => "Signed in!"
  end
 
  def destroy
    session[:user_id] = nil
    session[:access_token] = nil
    redirect_to root_url, :notice => "Signed out!"
  end

  def retrieve_access_token
    render json: session[:access_token].to_json
  end
 
end
