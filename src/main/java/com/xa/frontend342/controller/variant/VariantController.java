package com.xa.frontend342.controller.variant;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("variant")
public class VariantController {
    @GetMapping("")
    public ModelAndView home() {
        ModelAndView view = new ModelAndView("variant/index");
        view.addObject("title", "Variant");
        return view;
    }
    @GetMapping("/form")
    public ModelAndView form() {
        ModelAndView view = new ModelAndView("variant/form");
        return view;
    }
}
