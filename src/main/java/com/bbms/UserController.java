package com.bbms;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserRepository repo;

  public UserController(UserRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public List<User> allUsers() {
    return repo.findAll();
  }

  @GetMapping("/donors")
  public List<User> getDonors() {
    return repo.findByRoleIgnoreCase("DONOR");
  }
}
