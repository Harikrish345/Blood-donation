package com.bbms;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service public class UserService {
 private final UserRepository repo; private final PasswordEncoder encoder;
 public UserService(UserRepository r,PasswordEncoder e){repo=r;encoder=e;}
 public User register(String n,String email,String password,String blood){return register(n,email,password,blood,"DONOR");}
 public User register(String n,String email,String password,String blood,String role){if(repo.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already registered"); return repo.save(new User(n,email,encoder.encode(password),blood,role));}
 public User login(String email,String password){User u=repo.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid credentials")); if(!encoder.matches(password,u.getPasswordHash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid credentials"); return u;}
}
