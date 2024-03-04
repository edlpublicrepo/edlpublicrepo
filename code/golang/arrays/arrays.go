package main

import (
	"fmt"
)

func main() {
	var a [5]int
	fmt.Println(a)

	a[4] = 100
	fmt.Println("Set:", a)
	fmt.Println("Get:", a[4])

	fmt.Println("Length:", len(a))

	num1 := 1
	b := [5]int{0, num1, 2, 3, 4}
	fmt.Println("b:", b)

	var twoDimensional [2][4]int
	for i := 0; i < 2; i++ {
		for j := 0; j < 4; j++ {
			twoDimensional[i][j] = i + j
			fmt.Println("testing", twoDimensional)
		}
	}
	fmt.Println(twoDimensional)
}
