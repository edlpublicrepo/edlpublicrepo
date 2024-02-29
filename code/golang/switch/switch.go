package main

import (
	"fmt"
	"time"
)

func main() {
	// This is a standard switch statement
	i := 2
	fmt.Print("Write ", i, " as ")
	switch i {
	case 1:
		fmt.Println("one")
	case 2:
		fmt.Println("two")
	case 3:
		fmt.Println("three")
	}

	// Statements can have defaults if you don't have a specific case value
	// Also, you can you a comma to seperate multiple case conditions for one set of actions
	day := time.Now().Weekday()
	switch day {
	case time.Saturday, time.Sunday:
		fmt.Println("It's the weekend!")
	default:
		fmt.Println("It's the weekday!")
	}

	// A switch statement without an expression can be used as an if/else statement
	t0 := time.Now()
	switch {
	case t0.Hour() > 12:
		fmt.Println("It's past noon!")
	default:
		fmt.Println("It's before noon!")
	}

	// A type switch compares types as instead of values.
	whatAmI := func(i interface{}) {
		switch t := i.(type) {
		case bool:
			fmt.Println("I'm a boolean!")
		case int:
			fmt.Println("I'm an integer!")
		default:
			fmt.Printf("I don't know what is a '%T'\n", t)
		}
	}

	whatAmI(true)
	whatAmI(42)
	whatAmI("Hello!")
}
