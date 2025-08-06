import os
import requests
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import facebook
from dotenv import load_dotenv

load_dotenv()

facebook_auth_bp = Blueprint('facebook_auth', __name__)

# Facebook App Configuration
FACEBOOK_APP_ID = os.getenv('FACEBOOK_APP_ID', 'your_facebook_app_id')
FACEBOOK_APP_SECRET = os.getenv('FACEBOOK_APP_SECRET', 'your_facebook_app_secret')

@facebook_auth_bp.route('/facebook/verify', methods=['POST'])
@cross_origin()
def verify_facebook_token():
    """
    Verify Facebook access token and get user information
    """
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Access token is required'
            }), 400
        
        # Verify token with Facebook Graph API
        graph = facebook.GraphAPI(access_token=access_token)
        
        try:
            # Get user profile information
            user_profile = graph.get_object('me', fields='id,name,email,picture')
            
            # Verify the token is valid and belongs to our app
            token_info = graph.get_object('me/permissions')
            
            # Additional verification: Check if token is valid for our app
            app_token_url = f"https://graph.facebook.com/oauth/access_token?client_id={FACEBOOK_APP_ID}&client_secret={FACEBOOK_APP_SECRET}&grant_type=client_credentials"
            app_token_response = requests.get(app_token_url)
            app_token = app_token_response.json().get('access_token')
            
            # Verify user token against our app
            verify_url = f"https://graph.facebook.com/debug_token?input_token={access_token}&access_token={app_token}"
            verify_response = requests.get(verify_url)
            token_data = verify_response.json()
            
            if not token_data.get('data', {}).get('is_valid'):
                return jsonify({
                    'success': False,
                    'error': 'Invalid Facebook token'
                }), 401
            
            # Check if token belongs to our app
            if token_data.get('data', {}).get('app_id') != FACEBOOK_APP_ID:
                return jsonify({
                    'success': False,
                    'error': 'Token does not belong to this app'
                }), 401
            
            # Return user information
            return jsonify({
                'success': True,
                'user': {
                    'id': user_profile.get('id'),
                    'name': user_profile.get('name'),
                    'email': user_profile.get('email'),
                    'picture': user_profile.get('picture', {}).get('data', {}).get('url'),
                    'facebook_id': user_profile.get('id')
                },
                'token_info': {
                    'expires_at': token_data.get('data', {}).get('expires_at'),
                    'scopes': token_data.get('data', {}).get('scopes', [])
                }
            })
            
        except facebook.GraphAPIError as e:
            return jsonify({
                'success': False,
                'error': f'Facebook API error: {str(e)}'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@facebook_auth_bp.route('/facebook/login', methods=['POST'])
@cross_origin()
def facebook_login():
    """
    Handle Facebook login and create/update user session
    """
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Access token is required'
            }), 400
        
        # Verify the token first
        verification_result = verify_facebook_token_internal(access_token)
        
        if not verification_result['success']:
            return jsonify(verification_result), 401
        
        user_data = verification_result['user']
        
        # Here you would typically:
        # 1. Check if user exists in your database
        # 2. Create new user if doesn't exist
        # 3. Update user information if exists
        # 4. Create session token for your app
        
        # For now, we'll return the user data with a simple session token
        session_token = f"session_{user_data['id']}_{access_token[:10]}"
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user_data,
            'session_token': session_token
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Login error: {str(e)}'
        }), 500

def verify_facebook_token_internal(access_token):
    """
    Internal function to verify Facebook token
    """
    try:
        graph = facebook.GraphAPI(access_token=access_token)
        user_profile = graph.get_object('me', fields='id,name,email,picture')
        
        # Get app token for verification
        app_token_url = f"https://graph.facebook.com/oauth/access_token?client_id={FACEBOOK_APP_ID}&client_secret={FACEBOOK_APP_SECRET}&grant_type=client_credentials"
        app_token_response = requests.get(app_token_url)
        app_token = app_token_response.json().get('access_token')
        
        # Verify token
        verify_url = f"https://graph.facebook.com/debug_token?input_token={access_token}&access_token={app_token}"
        verify_response = requests.get(verify_url)
        token_data = verify_response.json()
        
        if not token_data.get('data', {}).get('is_valid'):
            return {
                'success': False,
                'error': 'Invalid Facebook token'
            }
        
        return {
            'success': True,
            'user': {
                'id': user_profile.get('id'),
                'name': user_profile.get('name'),
                'email': user_profile.get('email'),
                'picture': user_profile.get('picture', {}).get('data', {}).get('url'),
                'facebook_id': user_profile.get('id')
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@facebook_auth_bp.route('/facebook/logout', methods=['POST'])
@cross_origin()
def facebook_logout():
    """
    Handle Facebook logout
    """
    try:
        # In a real app, you would:
        # 1. Invalidate the session token
        # 2. Clear user session data
        # 3. Optionally revoke Facebook token
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Logout error: {str(e)}'
        }), 500

@facebook_auth_bp.route('/facebook/config', methods=['GET'])
@cross_origin()
def get_facebook_config():
    """
    Get Facebook app configuration for frontend
    """
    return jsonify({
        'app_id': FACEBOOK_APP_ID,
        'version': 'v18.0'  # Facebook API version
    })

