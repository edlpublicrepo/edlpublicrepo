package main

import (
	"fmt"
	"slices"
)

func main() {
	var s []string
	fmt.Println("s:", s, s == nil, len(s) == 0)

	s = make([]string, 3)
	fmt.Println("empty:", s, len(s), cap(s))

	s[0] = "a"
	s[1] = "b"
	s[2] = "c"
	fmt.Println("set:", s)
	fmt.Println("get:", s[2])

	fmt.Println("len:", len(s))

	s = append(s, "d")
	s = append(s, "e")

	fmt.Println("append:", s)

	c := make([]string, len(s))
	fmt.Println((c))
	copy(c, s)
	fmt.Println((c))

	sub_slice := s[2:5]
	fmt.Println("sub_slice:", sub_slice)

	t := []string{"g", "h", "i"}
	print("declerative:", t)

	t2 := []string{"g", "h", "i"}
	if slices.Equal(t, t2) {
		fmt.Println(("t == t2"))
	}
}
