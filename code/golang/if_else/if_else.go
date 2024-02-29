package main

import (
	"fmt"
)

func main() {
	num := 7
	if num%2 == 0 {
		fmt.Println("Num '", num, "' is even")
	} else {
		fmt.Println("Num '", num, "' is odd")
	}

	if new_Num := 9; new_Num < 0 {
		fmt.Println(new_Num, "is negative")
	} else if new_Num < 10 {
		fmt.Println(new_Num, "has one digit")
	} else {
		fmt.Println(new_Num, "has multiple digits")
	}
}
