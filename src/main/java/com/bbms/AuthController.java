package com.bbms;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserService users;
  public AuthController(UserService users) { this.users = users; }

  @PostMapping("/login")
  public User login(@Valid @RequestBody LoginRequest request) {
    return users.login(request.email(), request.password());
  }

  @PostMapping("/register/donor")
  @ResponseStatus(HttpStatus.CREATED)
  public User register(@Valid @RequestBody DonorRequest request) {
    return users.register(request.fullName(), request.email(), request.password(), request.bloodGroup());
  }

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
  public record DonorRequest(@NotBlank String fullName, @Email @NotBlank String email,
                             @NotBlank String password, @NotBlank String bloodGroup) {}
}
